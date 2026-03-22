'use client'

import { Side } from '@/lib/types'

interface PixelCharacterProps {
  side: Side
  isSelected: boolean
}

// CSS pixel-art characters built with box-shadow pixel grids
export default function PixelCharacter({ side, isSelected }: PixelCharacterProps) {
  return (
    <div className={`pixel-character-wrapper ${side} ${isSelected ? 'selected' : ''}`}>
      {side === 'believer' ? <BelieverSprite /> : <SkepticSprite />}
    </div>
  )
}

function BelieverSprite() {
  return (
    <div className="pixel-sprite believer-sprite" aria-label="Believer character: luminous robed figure">
      {/* CSS pixel art: robed figure with halo crown */}
      <div className="sprite-container">
        {/* Halo ring */}
        <div className="pixel-row halo-row">
          <div className="px b0" />
          <div className="px halo" />
          <div className="px halo" />
          <div className="px halo" />
          <div className="px halo" />
          <div className="px halo" />
          <div className="px b0" />
        </div>
        {/* Head */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px b0" />
          <div className="px skin" />
          <div className="px skin" />
          <div className="px skin" />
          <div className="px b0" />
          <div className="px b0" />
        </div>
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px skin" />
          <div className="px eye-b" />
          <div className="px skin" />
          <div className="px eye-b" />
          <div className="px skin" />
          <div className="px b0" />
        </div>
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px skin" />
          <div className="px skin" />
          <div className="px smile" />
          <div className="px skin" />
          <div className="px skin" />
          <div className="px b0" />
        </div>
        {/* Shoulders */}
        <div className="pixel-row">
          <div className="px robe-l" />
          <div className="px robe-l" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe-r" />
          <div className="px robe-r" />
        </div>
        {/* Body */}
        <div className="pixel-row">
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px glow-c" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
        </div>
        <div className="pixel-row">
          <div className="px robe" />
          <div className="px arm" />
          <div className="px robe" />
          <div className="px glow-c" />
          <div className="px robe" />
          <div className="px arm" />
          <div className="px robe" />
        </div>
        <div className="pixel-row">
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px glow-c" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
        </div>
        {/* Lower robe */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px robe" />
          <div className="px b0" />
        </div>
        {/* Feet */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px b0" />
          <div className="px foot" />
          <div className="px b0" />
          <div className="px foot" />
          <div className="px b0" />
          <div className="px b0" />
        </div>
      </div>
    </div>
  )
}

function SkepticSprite() {
  return (
    <div className="pixel-sprite skeptic-sprite" aria-label="Skeptic character: grounded rational thinker">
      <div className="sprite-container">
        {/* Thought indicator */}
        <div className="pixel-row thought-row">
          <div className="px b0" />
          <div className="px b0" />
          <div className="px atom" />
          <div className="px atom" />
          <div className="px atom" />
          <div className="px b0" />
          <div className="px b0" />
        </div>
        {/* Head */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px b0" />
          <div className="px hair" />
          <div className="px hair" />
          <div className="px hair" />
          <div className="px b0" />
          <div className="px b0" />
        </div>
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px skin2" />
          <div className="px eye-c" />
          <div className="px skin2" />
          <div className="px eye-c" />
          <div className="px skin2" />
          <div className="px b0" />
        </div>
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px skin2" />
          <div className="px skin2" />
          <div className="px ponder" />
          <div className="px skin2" />
          <div className="px skin2" />
          <div className="px b0" />
        </div>
        {/* Collar */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px jacket" />
          <div className="px shirt" />
          <div className="px shirt" />
          <div className="px shirt" />
          <div className="px jacket" />
          <div className="px b0" />
        </div>
        {/* Body */}
        <div className="pixel-row">
          <div className="px jacket" />
          <div className="px jacket" />
          <div className="px shirt" />
          <div className="px shirt" />
          <div className="px shirt" />
          <div className="px jacket" />
          <div className="px jacket" />
        </div>
        <div className="pixel-row">
          <div className="px arm2" />
          <div className="px jacket" />
          <div className="px jacket" />
          <div className="px shirt" />
          <div className="px jacket" />
          <div className="px jacket" />
          <div className="px arm2" />
        </div>
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px jacket" />
          <div className="px jacket" />
          <div className="px pants" />
          <div className="px jacket" />
          <div className="px jacket" />
          <div className="px b0" />
        </div>
        {/* Legs */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px pants" />
          <div className="px pants" />
          <div className="px b0" />
          <div className="px pants" />
          <div className="px pants" />
          <div className="px b0" />
        </div>
        {/* Feet */}
        <div className="pixel-row">
          <div className="px b0" />
          <div className="px b0" />
          <div className="px shoe" />
          <div className="px b0" />
          <div className="px shoe" />
          <div className="px b0" />
          <div className="px b0" />
        </div>
      </div>
    </div>
  )
}
