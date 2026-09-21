import React from 'react';
import { SportMindArena } from '../../components/sportmind/SportMindArena';

export function SportMindArenaPage() {
  return (
    <div className="sportmind-page-wrapper">
      <SportMindArena isStandalonePage={true} />
    </div>
  );
}

export default SportMindArenaPage;
