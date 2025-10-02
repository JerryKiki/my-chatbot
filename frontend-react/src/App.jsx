import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  };

  const classify = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file); // 이름 "file" 중요!

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/classify`, {
        method: "POST",
        body: form, // Content-Type 수동 지정 금지!
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        alert("백엔드 오류: " + text);
        setResult(null);
        return;
      }

      const data = await res.json();
      if (!data?.top1) {
        console.error("Unexpected payload:", data);
        alert("예상치 못한 응답 형식");
        setResult(null);
        return;
      }

      setResult(data);
    } catch (e) {
      console.error(e);
      alert("네트워크 오류: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h1>ResNet50 이미지 분류</h1>

      <input type="file" accept="image/*" onChange={onFile} />
      {preview && (
        <div style={{ marginTop: 12 }}>
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", border: "1px solid #ddd" }}
          />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={classify} disabled={!file || loading}>
          {loading ? "분류 중..." : "분류하기"}
        </button>
      </div>

      {result?.top1 && (
        <>
          <h3>Top-1</h3>
          <p>
            <b>{result.top1.label}</b> ({(result.top1.prob * 100).toFixed(2)}%)
          </p>
          <h4>Top-5</h4>
          <ul>
            {result.top5?.map((r, i) => (
              <li key={i}>
                {r.label} — {(r.prob * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
