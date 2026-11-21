import React, { useState } from 'react';
import { useDisguise } from '../../context/DisguiseContext';
import { ShieldCheck, Eye, Sun, CloudRain } from 'lucide-react';

export default function DisguiseScreen() {
  const { deactivateDisguise, disguiseType } = useDisguise();
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [formula, setFormula] = useState('');

  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setFormula('');
    } else if (val === '=') {
      // Secret backdoor PIN to exit disguise: entering 7777 = or 911 = exits
      if (calcDisplay === '7777' || calcDisplay === '911' || calcDisplay === '1234') {
        deactivateDisguise();
        return;
      }
      try {
        const sanitized = formula.replace(/[^-()\d/*+.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized || calcDisplay})`)();
        setCalcDisplay(String(result));
        setFormula('');
      } catch (e) {
        setCalcDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setFormula(calcDisplay + ' ' + val + ' ');
      setCalcDisplay('0');
    } else {
      setCalcDisplay(prev => prev === '0' ? val : prev + val);
      setFormula(prev => prev + val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-between p-4 max-w-md mx-auto font-sans select-none">
      {/* Top Bar masquerading as phone app */}
      <div className="w-full flex items-center justify-between py-2 border-b border-zinc-800 text-xs text-zinc-400">
        <span 
          onClick={deactivateDisguise} 
          title="SafeHer Quick Unmask" 
          className="cursor-pointer hover:text-white flex items-center gap-1 font-medium"
        >
          {disguiseType === 'calculator' ? 'Calculator' : 'Weather'}
        </span>
        <button 
          onClick={deactivateDisguise}
          className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-300 flex items-center gap-1 transition"
        >
          <ShieldCheck className="w-3 h-3 text-rose-400" />
          <span>Exit Stealth</span>
        </button>
      </div>

      {disguiseType === 'calculator' ? (
        <div className="w-full flex-1 flex flex-col justify-end pb-8">
          {/* Formula preview */}
          <div className="text-right text-zinc-400 text-sm h-6 px-4 truncate">
            {formula}
          </div>
          {/* Main result */}
          <div className="text-right text-white text-5xl font-light px-4 py-4 truncate">
            {calcDisplay}
          </div>

          {/* Calculator Pad */}
          <div className="grid grid-cols-4 gap-3 px-2">
            {['C', '+/-', '%', '/'].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcClick(btn)}
                className="h-16 rounded-full bg-zinc-700 text-black text-xl font-medium active:bg-zinc-600 transition"
              >
                {btn}
              </button>
            ))}
            {['7', '8', '9', '*'].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcClick(btn)}
                className={`h-16 rounded-full text-xl font-medium transition ${btn === '*' ? 'bg-amber-600 active:bg-amber-500' : 'bg-zinc-800 active:bg-zinc-700'}`}
              >
                {btn}
              </button>
            ))}
            {['4', '5', '6', '-'].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcClick(btn)}
                className={`h-16 rounded-full text-xl font-medium transition ${btn === '-' ? 'bg-amber-600 active:bg-amber-500' : 'bg-zinc-800 active:bg-zinc-700'}`}
              >
                {btn}
              </button>
            ))}
            {['1', '2', '3', '+'].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcClick(btn)}
                className={`h-16 rounded-full text-xl font-medium transition ${btn === '+' ? 'bg-amber-600 active:bg-amber-500' : 'bg-zinc-800 active:bg-zinc-700'}`}
              >
                {btn}
              </button>
            ))}
            <button
              onClick={() => handleCalcClick('0')}
              className="col-span-2 h-16 rounded-full bg-zinc-800 text-xl font-medium text-left pl-7 active:bg-zinc-700 transition"
            >
              0
            </button>
            <button
              onClick={() => handleCalcClick('.')}
              className="h-16 rounded-full bg-zinc-800 text-xl font-medium active:bg-zinc-700 transition"
            >
              .
            </button>
            <button
              onClick={() => handleCalcClick('=')}
              className="h-16 rounded-full bg-amber-600 text-xl font-medium active:bg-amber-500 transition"
            >
              =
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Sun className="w-16 h-16 text-amber-400 mb-3" />
          <h2 className="text-3xl font-light">Metro City</h2>
          <p className="text-6xl font-extralight my-2">68°F</p>
          <p className="text-zinc-400">Partly Cloudy • Humidity 45%</p>
        </div>
      )}

      {/* Stealth Hint */}
      <div className="text-center text-[10px] text-zinc-600">
        Discreet disguise mode active. Tap 'Exit Stealth' or enter 7777 =
      </div>
    </div>
  );
}
