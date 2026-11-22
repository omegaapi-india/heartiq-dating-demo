import {
  PROFILES,
  DEMO_PREFERENCES,
  scorePair,
  starterLines,
  redactContact,
  scoreClass,
  getProfile
} from '/lib/match.js';
import { buildModelPrompt } from '/lib/model.js';

const STORAGE_KEY = 'heartiq_demo_v1';
const LOCAL_BRIDGE = 'http://127.0.0.1:8791/icebreakers';

const byId = (id) => document.getElementById(id);
const validIds = new Set(PROFILES.map((profile) => profile.id));

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      likes: Array.isArray(raw.likes) ? raw.likes.filter((id) => validIds.has(id)) : [],
      passes: Array.isArray(raw.passes) ? raw.passes.filter((id) => validIds.has(id)) : []
    };
  } catch {
    return { likes: [], passes: [] };
  }
}

const state = loadState();
let activeProfile = PROFILES[0];
let activeResult = scorePair(activeProfile, DEMO_PREFERENCES);

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    setStatus(byId('deck-status'), 'Browser storage is unavailable; this session will not be saved.', 'error');
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = 'status' + (type ? ' ' + type : '');
}

function checkedValues(name) {
  return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map((input) => input.value);
}

function currentPreferences() {
  const distance = Number(byId('pref-distance')?.value || DEMO_PREFERENCES.maxDistanceKm);
  return {
    values: checkedValues('values'),
    interests: checkedValues('interests'),
    intent: byId('pref-intent')?.value || DEMO_PREFERENCES.intent,
    style: byId('pref-style')?.value || DEMO_PREFERENCES.style,
    maxDistanceKm: Number.isFinite(distance) ? distance : DEMO_PREFERENCES.maxDistanceKm
  };
}

function scoreMarkup(result, score) {
  const value = typeof score === 'number' ? score : result.score;
  return '<span class="score-pill ' + scoreClass(value) + '">' + value + '%</span>';
}

function profileCardMarkup(profile, result) {
  const reasons = result.reasons.slice(0, 2).map((item) => '<li>' + escapeHtml(item) + '</li>').join('');
  return [
    '<article class="profile-card">',
    '  <div class="card-top">',
    '    <div class="avatar ' + escapeHtml(profile.gradient) + '">' + escapeHtml(profile.emoji) + '</div>',
    '    <div class="profile-meta"><strong>' + escapeHtml(profile.name) + ', ' + profile.age + '</strong><span>' + escapeHtml(profile.city) + ' · ' + profile.distanceKm + ' km in demo</span></div>',
    scoreMarkup(result),
    '  </div>',
    '  <div class="score-bar"><i data-width="' + result.score + '"></i></div>',
    '  <ul class="reason-list">' + reasons + '</ul>',
    '  <div class="card-actions">',
    '    <button class="button small ghost" type="button" data-view="' + escapeHtml(profile.id) + '">View profile</button>',
    '    <button class="button small primary" type="button" data-like="' + escapeHtml(profile.id) + '">Like</button>',
    '  </div>',
    '</article>'
  ].join('');
}

function renderRanking() {
  const prefs = currentPreferences();
  const ranked = PROFILES
    .map((profile) => ({ profile, result: scorePair(profile, prefs) }))
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 9);

  byId('ranking').innerHTML = ranked.map((item) => profileCardMarkup(item.profile, item.result)).join('');
  byId('ranking').querySelectorAll('.score-bar i').forEach((bar) => {
    bar.style.width = bar.dataset.width + '%';
  });

  if (byId('pref-distance-output')) {
    byId('pref-distance-output').textContent = prefs.maxDistanceKm + ' km';
  }
}

function deckMarkup(profile, result) {
  const values = profile.values.map((item) => '<span class="tag">' + escapeHtml(item) + '</span>').join('');
  const interests = profile.interests.slice(0, 4).map((item) => '<span class="tag">' + escapeHtml(item) + '</span>').join('');
  const flags = profile.greenFlags.map((item) => '<span class="tag green">' + escapeHtml(item) + '</span>').join('');
  return [
    '<article class="swipe-card">',
    '  <div class="swipe-body">',
    '    <div class="avatar ' + escapeHtml(profile.gradient) + '">' + escapeHtml(profile.emoji) + '</div>',
    '    <div>',
    '      <h3>' + escapeHtml(profile.name) + ', ' + profile.age + '</h3>',
    '      <p class="fine-print">' + escapeHtml(profile.city) + ' · ' + profile.distanceKm + ' km · ' + escapeHtml(profile.intent) + '</p>',
    '      <p class="prompt-q">' + escapeHtml(profile.promptQ) + '</p>',
    '      <p class="prompt-a">' + escapeHtml(redactContact(profile.promptA)) + '</p>',
    '      <div class="tag-row">' + values + interests + flags + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="swipe-actions">',
    '    <button class="button pass" type="button" id="pass-button">Pass</button>',
    '    <button class="button like" type="button" id="like-button">Like</button>',
    '  </div>',
    '  <p class="fine-print">Compatibility ' + result.score + '% · ' + escapeHtml(result.reasons[0]) + '</p>',
    '</article>'
  ].join('');
}

function renderDeck() {
  const remaining = PROFILES.filter((profile) => !state.likes.includes(profile.id) && !state.passes.includes(profile.id));
  const deck = byId('deck');

  if (!remaining.length) {
    deck.innerHTML = '<p class="empty">Every demo profile has been reviewed. Clear demo data to start again.</p>';
    byId('like-button')?.remove();
    byId('pass-button')?.remove();
    setStatus(byId('deck-status'), 'All 12 demo profiles reviewed. Likes and passes stay in this browser only.', 'ok');
    return;
  }

  activeProfile = remaining[0];
  activeResult = scorePair(activeProfile, currentPreferences());
  deck.innerHTML = deckMarkup(activeProfile, activeResult);
  byId('like-button').addEventListener('click', () => recordChoice('like'));
  byId('pass-button').addEventListener('click', () => recordChoice('pass'));
  setStatus(byId('deck-status'), remaining.length + ' demo profiles left. Choices are saved in this browser only.');
  renderActiveContext();
}

function recordChoice(kind) {
  const id = activeProfile.id;
  if (kind === 'like' && !state.likes.includes(id)) state.likes.push(id);
  if (kind === 'pass' && !state.passes.includes(id)) state.passes.push(id);
  saveState();
  renderDeck();
  renderMatches();
}

function matchMarkup(profile, result, index) {
  const lines = starterLines(profile, result);
  return [
    '<div class="match-item">',
    '  <div class="avatar ' + escapeHtml(profile.gradient) + '">' + escapeHtml(profile.emoji) + '</div>',
    '  <div><strong>' + escapeHtml(profile.name) + ', ' + profile.age + '</strong><small>' + escapeHtml(profile.city) + ' · likes you too</small></div>',
    scoreMarkup(result),
    '</div>',
    '<div class="line-list">',
    lines.map((line, lineIndex) => (
      '<div class="line-item"><p>' + escapeHtml(line) + '</p><button class="button small ghost copy-btn" type="button" data-copy="' + index + '-' + lineIndex + '">Copy</button></div>'
    )).join(''),
    '</div>'
  ].join('');
}

function renderMatches() {
  const matches = state.likes
    .map((id) => getProfile(id))
    .filter((profile) => profile && profile.likesYou)
    .map((profile) => ({ profile, result: scorePair(profile, currentPreferences()) }));

  const container = byId('match-list');
  if (!matches.length) {
    container.innerHTML = '<p class="empty">No mutual demo match yet. Like a profile marked as interested to unlock starter lines.</p>';
    return;
  }

  container.innerHTML = matches.map((item, index) => matchMarkup(item.profile, item.result, index)).join('');

  container.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const parts = button.dataset.copy.split('-');
      const match = matches[Number(parts[0])];
      const line = starterLines(match.profile, match.result)[Number(parts[1])];
      try {
        await navigator.clipboard.writeText(line);
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy'; }, 1400);
      } catch {
        setStatus(byId('model-status'), 'Clipboard is unavailable in this browser.', 'error');
      }
    });
  });
}

function renderActiveContext() {
  const context = byId('model-context');
  if (context) {
    context.textContent = 'Active demo profile: ' + activeProfile.name + ' · compatibility ' + activeResult.score + '%';
  }
  const rules = byId('rule-lines');
  if (rules) {
    rules.textContent = starterLines(activeProfile, activeResult).map((line) => '• ' + line).join('\n');
  }
}

function viewProfile(id) {
  const profile = getProfile(id);
  if (!profile) return;
  activeProfile = profile;
  activeResult = scorePair(profile, currentPreferences());
  renderActiveContext();
  byId('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderLines(targetId, lines) {
  byId(targetId).textContent = lines.map((line) => '• ' + line).join('\n');
}

async function generateLocal() {
  const button = byId('local-generate');
  setStatus(byId('model-status'), 'Contacting the local bridge…');
  button.disabled = true;
  try {
    const response = await fetch(LOCAL_BRIDGE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: buildModelPrompt(activeProfile, activeResult),
        model: 'llama3.2'
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'Local bridge error.');
    renderLines('local-lines', data.lines);
    setStatus(byId('model-status'), 'Local model answered. Nothing was stored.', 'ok');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Local bridge unavailable.';
    setStatus(byId('model-status'), 'Local bridge unavailable: ' + message + ' Start Ollama and run npm run bridge.', 'error');
  } finally {
    button.disabled = false;
  }
}

async function generateCloud(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const keyField = byId('cloud-key');
  const button = form.querySelector('button[type="submit"]');
  setStatus(byId('model-status'), 'Sending one request to your model endpoint…');
  button.disabled = true;

  try {
    const response = await fetch('/api/ai/icebreakers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        endpoint: byId('cloud-endpoint').value,
        model: byId('cloud-model').value,
        key: keyField.value,
        profile: activeProfile,
        result: activeResult
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'Cloud request failed.');
    renderLines('cloud-lines', data.lines);
    setStatus(byId('model-status'), 'Cloud model answered. Your key was used once and not stored.', 'ok');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloud request failed.';
    setStatus(byId('model-status'), message, 'error');
  } finally {
    keyField.value = '';
    button.disabled = false;
  }
}

function bindEvents() {
  byId('preferences-form').addEventListener('input', () => {
    renderRanking();
    renderDeck();
    renderMatches();
  });

  byId('ranking').addEventListener('click', (event) => {
    const view = event.target.closest('[data-view]');
    const like = event.target.closest('[data-like]');
    if (view) viewProfile(view.dataset.view);
    if (like) {
      const profile = getProfile(like.dataset.like);
      if (!profile) return;
      if (!state.likes.includes(profile.id)) state.likes.push(profile.id);
      saveState();
      renderDeck();
      renderMatches();
      setStatus(byId('deck-status'), 'Liked ' + profile.name + '. Choices are saved in this browser only.', 'ok');
    }
  });

  byId('clear-demo').addEventListener('click', () => {
    state.likes = [];
    state.passes = [];
    saveState();
    renderDeck();
    renderMatches();
    setStatus(byId('deck-status'), 'Demo choices cleared.', 'ok');
  });

  byId('local-generate').addEventListener('click', generateLocal);
  byId('cloud-form').addEventListener('submit', generateCloud);
}

function init() {
  DEMO_PREFERENCES.values.forEach((value) => {
    const input = document.querySelector('input[name="values"][value="' + value + '"]');
    if (input) input.checked = true;
  });
  DEMO_PREFERENCES.interests.forEach((value) => {
    const input = document.querySelector('input[name="interests"][value="' + value + '"]');
    if (input) input.checked = true;
  });
  bindEvents();
  renderRanking();
  renderDeck();
  renderMatches();
  renderActiveContext();
}

init();
