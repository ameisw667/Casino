'use client';

import React from 'react';
import { LobbyScrollChoreography } from './LobbyScrollChoreography';

interface LobbySectionHeaderProps {
  isMobile?: boolean;
}

/**
 * LobbySectionHeader: Architektonische Storyline- und Choreografie-Sektion
 * verbindet den Hero-Showcase mit dem Bento-Mosaik-Grid.
 */
export function LobbySectionHeader({ isMobile = false }: LobbySectionHeaderProps) {
  return <LobbyScrollChoreography isMobile={isMobile} />;
}
