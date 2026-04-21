import React from 'react';

export const W = {
  page:    "min-h-screen bg-white font-mono",
  card:    "border border-gray-300 rounded",
  input:   "w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-400 bg-white outline-none focus:border-gray-500",
  label:   "block text-xs text-gray-500 mb-1 font-medium",
  btn:     "border border-gray-400 rounded px-4 py-2 text-xs text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-colors",
  btnFill: "border border-gray-800 rounded px-4 py-2 text-xs text-white bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors",
  muted:   "text-gray-400",
  head:    "text-sm font-semibold text-gray-800",
  divider: "border-t border-gray-200",
  tag:     "border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-500",
};

export function ImgBox({ w = "w-full", h = "h-32", label }) {
  return (
    <div className={`${w} ${h} border border-gray-300 rounded bg-gray-100 relative flex items-center justify-center shrink-0 overflow-hidden`}>
      <svg className="absolute inset-0 w-full h-full text-gray-300" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1"/>
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1"/>
      </svg>
      {label && <span className="relative text-xs text-gray-400 bg-gray-100 px-1">{label}</span>}
    </div>
  );
}

export function TextLine({ w = "w-full", dark, className = "" }) {
  return <div className={`h-2 rounded-sm ${dark ? "bg-gray-300" : "bg-gray-200"} ${w} ${className}`}/>;
}

export function StatBox({ label, value }) {
  return (
    <div className="border border-gray-300 rounded p-4">
      <div className="text-gray-400 uppercase tracking-widest mb-2" style={{fontSize:"9px"}}>{label}</div>
      <div className="text-2xl font-bold text-gray-700 mb-1">{value}</div>
      <TextLine w="w-1/2"/>
    </div>
  );
}

export function TableBox({ headers, rows = 4, data = null }) {
  const cols = headers.length;
  const loopCount = data ? data.length : rows;

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      <div className="grid border-b border-gray-300 bg-gray-50" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>
        {headers.map(h => (
          <div key={h} className="px-3 py-2 font-bold text-gray-500 uppercase tracking-wide border-r border-gray-200 last:border-0" style={{fontSize:"9px"}}>{h}</div>
        ))}
      </div>
      {Array.from({length: loopCount}).map((_,i) => (
        <div key={i} className="grid border-b border-gray-100 last:border-0 hover:bg-gray-50" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>
          {headers.map((_,j) => (
            <div key={j} className="px-3 py-3 border-r border-gray-100 last:border-0 flex items-center">
              {j === 0
                ? <TextLine w="w-28" dark/>
                : j === cols-1
                  ? <span className="border border-gray-300 rounded px-2 py-0.5 text-gray-400" style={{fontSize:"10px"}}>——</span>
                  : <TextLine w="w-16"/>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Section({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-bold text-gray-500 uppercase tracking-widest" style={{fontSize:"9px"}}>{title}</span>
      {action && <button className={W.btn} onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Field({ label, placeholder, type = "text", value, onChange, readOnly }) {
  return (
    <div>
      <label className={W.label}>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className={W.input} 
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
}

export function Select({ label, options, value, onChange }) {
  return (
    <div>
      <label className={W.label}>{label}</label>
      <select className={W.input} value={value} onChange={onChange}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, placeholder, value, onChange, readOnly }) {
  return (
    <div>
      <label className={W.label}>{label}</label>
      <textarea 
        placeholder={placeholder} 
        rows={3} 
        className={`${W.input} resize-none`} 
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
}

export function UploadBox({ label }) {
  return (
    <div>
      <label className={W.label}>{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
        <div className="text-xs text-gray-400">[ Dosya sec veya surukle birak ]</div>
        <div className="text-gray-300 mt-1" style={{fontSize:"10px"}}>PDF, DOCX desteklenir</div>
      </div>
    </div>
  );
}

export function BarChart() {
  return (
    <div className="flex items-end gap-1 h-28 pt-2">
      {[35,55,40,70,60,80,50,65,45,72,58,68].map((v,i) => (
        <div key={i} className="flex-1 border border-gray-300 bg-gray-100 rounded-sm" style={{height:`${v}%`}}/>
      ))}
    </div>
  );
}
