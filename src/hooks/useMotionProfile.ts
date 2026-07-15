import { useEffect, useState } from 'react';
import type { MotionProfile } from '../data/cursorThemes';
import { getMotionProfile, subscribeMotionProfile } from '../settings/motionProfile';

/** Live motion profile for the active Mode. Components read this to make their
 *  reveals adapt per cursor theme. Reduced-motion should still be checked separately. */
export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>(getMotionProfile);
  useEffect(() => subscribeMotionProfile(() => setProfile(getMotionProfile())), []);
  return profile;
}
