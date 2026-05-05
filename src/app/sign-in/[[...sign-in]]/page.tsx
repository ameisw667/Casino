import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 'clamp(12px, 5vw, 40px)', background: 'hsla(var(--primary), 0.02)' }}>
      <SignIn />
    </div>
  );
}
