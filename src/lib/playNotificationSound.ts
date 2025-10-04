// Lightweight notification sound player using Web Audio API.
// Respects localStorage key 'notificationSoundEnabled' (default: enabled).
export async function playNotificationSound(): Promise<void> {
  try {
    if (typeof window === "undefined") return;

    // Respect user preference stored in localStorage. Default: enabled.
    try {
      const setting = window.localStorage.getItem("notificationSoundEnabled");
      if (setting && setting.toLowerCase() === "false") return;
    } catch {
      // ignore storage errors and proceed
    }

    const AudioCtx: typeof AudioContext | undefined =
      (window.AudioContext as typeof AudioContext) ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Some browsers require user interaction before audio can play. Try to resume if suspended.
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // resume may fail if no user gesture; swallow the error
      }
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    // gentle attack
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.01);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    // small downward glide to make the tone pleasant
    oscillator.frequency.exponentialRampToValueAtTime(
      620,
      ctx.currentTime + 0.16
    );
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.31);

    // Close AudioContext after a short delay to free resources
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    }, 700);
  } catch (error) {
    // Keep failures silent - audio should not break the app
    // console.warn can be useful during development
    // but we don't want to fail the app if audio can't play
    console.warn("Could not play notification sound:", error);
  }
}

export default playNotificationSound;
