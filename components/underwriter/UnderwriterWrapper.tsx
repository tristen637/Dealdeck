'use client'
// This wraps the core Underwriter tool and replaces direct Anthropic calls
// with server-side API calls so the API key stays secure.

import { useEffect, useState } from 'react'

// Patch the global fetch so callAI() in Underwriter.jsx routes through /api/underwrite
if (typeof window !== 'undefined') {
  const _fetch = window.fetch.bind(window)
  ;(window as any).__anthropicFetch = async (url: string, options: any) => {
    if (url === 'https://api.anthropic.com/v1/messages') {
      const res = await _fetch('/api/underwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: JSON.parse(options.body).messages }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'API error ' + res.status)
      }
      const data = await res.json()
      // Return in Anthropic API shape
      return { ok: true, json: async () => data }
    }
    return _fetch(url, options)
  }
}

export { default } from './Underwriter'
