"use client";

import { useState } from "react";

export function JobImage({ src, alt, uploadedAt: _uploadedAt }: { src: string; alt: string; uploadedAt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="panel" style={{ padding: '0.75rem', overflow: 'hidden' }}>
        <div style={{ position: 'relative', cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} onClick={() => setIsOpen(true)}>
          <img 
            src={src} 
            alt={alt} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '400px', 
              objectFit: 'contain',
              display: 'block',
              transition: 'transform 0.3s ease'
            }} 
            className="blog-style-image"
          />
          <div style={{ 
            position: 'absolute', 
            top: '0.75rem', 
            right: '0.75rem', 
            background: 'rgba(255,255,255,0.9)', 
            padding: '0.4rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>Verified Source Image</p>
          <a href={src} target="_blank" rel="noreferrer" className="button secondary small" style={{ fontSize: '0.7rem' }}>Download</a>
        </div>
      </div>

      {isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.9)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 9999,
            padding: '2rem'
          }}
          onClick={() => setIsOpen(false)}
        >
          <button 
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', fontSize: '2.5rem', cursor: 'pointer' }}
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          <img 
            src={src} 
            alt={alt} 
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
