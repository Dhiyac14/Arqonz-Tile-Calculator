import React from 'react';

export function HowToUseCard() {
  return (
    <div className="how-to-use" style={{ background: '#fafbfc', borderRadius: '8px', padding: '24px 24px 18px 24px', marginTop: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#e4e7ef', color: '#444', fontWeight: 700, fontSize: '1.1em', marginRight: '10px', fontFamily: 'Montserrat, Arial, sans-serif' }}>?</span>
        <span style={{ fontWeight: 700, fontSize: '1.25em', color: '#222', letterSpacing: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>How To Use Tile Calculator</span>
      </div>
      <div style={{ color: '#666', fontSize: '1em', lineHeight: 1.7, fontFamily: 'Montserrat, Arial, sans-serif' }}>
        <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#222' }}>STEP 1:</span> Let us know whether you are looking for floor tiles or wall tiles.</div>
        <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#222' }}>STEP 2:</span> Let us know the total area of the space. Please ensure to deduct the area of any doors or windows to arrive at the final area. Please enter the area in either Sq. Feet or Sq. Metre only.</div>
        <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#222' }}>STEP 3:</span> Select the size of the tile you want from the dropdown option and click Calculate.</div>
        <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#222' }}>STEP 4:</span> You will get the total number of tiles required or total number of boxes of tiles required.</div>
        <div style={{ marginTop: '18px', fontSize: '0.95em', color: '#888', fontFamily: 'Montserrat, Arial, sans-serif' }}>
          <span style={{ fontWeight: 600, color: '#888' }}>Note :</span> Total tiles required are adjusted by 10% considering for wastage and design matching. It is assumed 4 tiles per box as a standard to calculate boxes.
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar" style={{ textAlign: 'left', padding: '32px 24px 24px 24px' }}>
      <div className="tile-calculator-intro">
          <div className="icon-title" style={{ display: 'flex', alignItems: 'center', marginBottom: '0', textAlign: 'left' }}>
              <img src="/calculator_Icon.png" alt="Calculator Icon" style={{ height: '80px', width: '80px', marginRight: '18px', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2.1em', color: '#222', lineHeight: 1.1, fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 0 }}>Tile Calculator</h2>
                <h3 style={{ margin: 0, fontWeight: 400, fontSize: '1.1em', color: '#444', letterSpacing: 0, marginTop: '2px', fontFamily: 'Montserrat, Arial, sans-serif' }}>Easy Steps</h3>
              </div>
          </div>
      </div>
      <HowToUseCard />
    </aside>
  );
}

export default Sidebar; 