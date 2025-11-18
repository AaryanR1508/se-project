// frontend/src/components/UI/Skeleton.jsx
import React from 'react'

export default function Skeleton({ className = "h-4 bg-gray-200 animate-pulse rounded", style }) {
  return <div className={className} style={style} />
}
