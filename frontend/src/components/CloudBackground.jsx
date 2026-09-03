import "./CloudBackground.css";

// Soft, slow-drifting cloud shapes behind the content. Purely decorative
// (aria-hidden) — this is the page's signature element per the brief:
// "make it look like the cloud."
export default function CloudBackground() {
  return (
    <div className="cloud-bg" aria-hidden="true">
      <svg className="cloud cloud-a" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 70 Q20 70 20 52 Q20 34 40 36 Q42 16 66 16 Q92 16 94 38 Q116 36 116 56 Q116 70 98 70 Z" />
      </svg>
      <svg className="cloud cloud-b" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 70 Q20 70 20 52 Q20 34 40 36 Q42 16 66 16 Q92 16 94 38 Q116 36 116 56 Q116 70 98 70 Z" />
      </svg>
      <svg className="cloud cloud-c" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 70 Q20 70 20 52 Q20 34 40 36 Q42 16 66 16 Q92 16 94 38 Q116 36 116 56 Q116 70 98 70 Z" />
      </svg>
      <svg className="cloud cloud-d" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 70 Q20 70 20 52 Q20 34 40 36 Q42 16 66 16 Q92 16 94 38 Q116 36 116 56 Q116 70 98 70 Z" />
      </svg>
    </div>
  );
}
