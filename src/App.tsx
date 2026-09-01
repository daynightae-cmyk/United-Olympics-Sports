import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CinematicSplash } from './components/brand/CinematicSplash';
import { HeaderNav } from './components/common/HeaderNav';
import { Footer } from './components/common/Footer';
import { PublicShowcaseView } from './components/public/PublicShowcaseView';
import { PlayerPassportView } from './components/player/PlayerPassportView';
import { ParentPortalView } from './components/parent/ParentPortalView';
import { CoachPortalView } from './components/coach/CoachPortalView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import {
  DEMO_PROFILES,
  DEMO_PROGRAMS,
  DEMO_BRANCHES,
  DEMO_PLAYERS,
  DEMO_TRAINING_SESSIONS,
  DEMO_MATCHES,
  DEMO_INVOICES,
  DEMO_DRILLS,
} from './data/demoData';
import { PortalType, UserProfile } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentPortal, setCurrentPortal] = useState<PortalType>('public');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES[0]);

  // Handle switching portals
  const handleSelectPortal = (portal: PortalType) => {
    setCurrentPortal(portal);
    // Automatically match the persona if switching to specific product
    const matchingProfile = DEMO_PROFILES.find((p) => p.portal === portal);
    if (matchingProfile) {
      setCurrentUser(matchingProfile);
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentPortal(user.portal);
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  // Filter children for parent portal (Talia Hassan and Adam Hassan)
  const parentChildren = DEMO_PLAYERS.filter(
    (p) => p.id === 'athlete-103' || p.id === 'athlete-105'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Cinematic Splash Staged Reveal */}
      <AnimatePresence>
        {showSplash && (
          <CinematicSplash onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Main Application Shell */}
      <HeaderNav
        currentPortal={currentPortal}
        onSelectPortal={handleSelectPortal}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        userProfiles={DEMO_PROFILES}
        onReplaySplash={handleReplaySplash}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentPortal === 'public' && (
          <PublicShowcaseView
            programs={DEMO_PROGRAMS}
            branches={DEMO_BRANCHES}
            matches={DEMO_MATCHES}
            onOpenEnrollment={() => {}}
          />
        )}

        {currentPortal === 'player' && (
          <PlayerPassportView
            player={DEMO_PLAYERS[0]}
            drills={DEMO_DRILLS}
            upcomingSessions={DEMO_TRAINING_SESSIONS}
          />
        )}

        {currentPortal === 'parent' && (
          <ParentPortalView
            childrenPlayers={parentChildren}
            invoices={DEMO_INVOICES}
            sessions={DEMO_TRAINING_SESSIONS}
          />
        )}

        {currentPortal === 'coach' && (
          <CoachPortalView
            squad={DEMO_PLAYERS}
            sessions={DEMO_TRAINING_SESSIONS}
            drills={DEMO_DRILLS}
          />
        )}

        {currentPortal === 'admin' && (
          <SuperAdminView
            programs={DEMO_PROGRAMS}
            branches={DEMO_BRANCHES}
            invoices={DEMO_INVOICES}
            players={DEMO_PLAYERS}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
