/**
 * Editable meeting / account details for the pre-join page.
 * Change values here, or override via URL query params:
 *   ?register=Apollo&owner=Michael&org=Uniswap%20Labs
 *   &when=Mon,%20Nov%209%202:00%20PM
 *   &user=Apollo&email=mal.apollo.vic@gmail.com
 *   &title=Custom%20full%20title%20override
 */
export const meetingDefaults = {
  userName: 'Apollo',
  email: 'mal.apollo.vic@gmail.com',
  /** Person who registered / created the meeting (shown first in the title). */
  registerName: 'K3',
  /** Invite owner (shown after “and”). */
  inviteOwnerName: 'Michael',
  /** Organization / meeting suffix after the dash. */
  meetingOrg: 'Uniswap Labs',
  scheduleLabel: 'Scheduled for',
  scheduleWhen: 'Sun, Nov 8, 10:30 PM',
  /**
   * Optional full title override. When set, register/owner/org are ignored.
   * Example: 'Apollo and Michael - Uniswap Labs'
   */
  meetingTitle: '',
};

/** Mic list from Meet sample screenshots (pre-join device menu). */
export const sampleMicDevices = [
  { id: 'sample-mic-xiberia', label: 'Microphone (XIBERIA)', systemDefault: true },
  { id: 'sample-mic-hd', label: 'Microphone (High Definition Audio Device)', systemDefault: false },
];

/** Speaker list from Meet sample screenshots (pre-join device menu). */
export const sampleSpeakerDevices = [
  { id: 'sample-spk-headphones-hd', label: 'Headphones (High Definition Audio Device)', systemDefault: true },
  { id: 'sample-spk-amd-hdmi', label: 'AMD HDMI Output (AMD High Definition Audio Device)', systemDefault: false },
  { id: 'sample-spk-xiberia', label: 'Speakers (XIBERIA)', systemDefault: false },
];

function param(search, key) {
  const v = search.get(key);
  return v == null || v === '' ? undefined : v;
}

/** Build the display title Meet shows on the pre-join panel. */
export function formatMeetingTitle({ meetingTitle, registerName, inviteOwnerName, meetingOrg }) {
  const custom = (meetingTitle || '').trim();
  if (custom) return custom;
  const left = [registerName, inviteOwnerName].filter(Boolean).join(' and ');
  if (left && meetingOrg) return `${left} - ${meetingOrg}`;
  return left || meetingOrg || 'Meeting';
}

/** Merge defaults with URL query overrides (for easy live updates). */
export function resolveMeetingConfig(search = typeof window !== 'undefined' ? window.location.search : '') {
  const q = new URLSearchParams(typeof search === 'string' ? search : '');
  const cfg = {
    ...meetingDefaults,
    userName: param(q, 'user') ?? param(q, 'userName') ?? meetingDefaults.userName,
    email: param(q, 'email') ?? meetingDefaults.email,
    registerName: param(q, 'register') ?? param(q, 'registerName') ?? meetingDefaults.registerName,
    inviteOwnerName: param(q, 'owner') ?? param(q, 'inviteOwnerName') ?? meetingDefaults.inviteOwnerName,
    meetingOrg: param(q, 'org') ?? param(q, 'meetingOrg') ?? meetingDefaults.meetingOrg,
    scheduleLabel: param(q, 'scheduleLabel') ?? meetingDefaults.scheduleLabel,
    scheduleWhen: param(q, 'when') ?? param(q, 'scheduleWhen') ?? meetingDefaults.scheduleWhen,
    meetingTitle: param(q, 'title') ?? param(q, 'meetingTitle') ?? meetingDefaults.meetingTitle,
  };
  cfg.displayTitle = formatMeetingTitle(cfg);
  return cfg;
}
