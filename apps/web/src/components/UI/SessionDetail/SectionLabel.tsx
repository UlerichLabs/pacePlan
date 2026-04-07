export function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
      textTransform: 'uppercase', color: 'var(--text-hint)',
      marginBottom: 10, marginTop: 24,
    }}>
      {text}
    </p>
  );
}
