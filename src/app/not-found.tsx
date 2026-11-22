import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page">
      <h1>Lost signal</h1>
      <p className="tagline">There&apos;s nothing at this address.</p>
      <Link className="btn btn--primary" href="/">
        Back to mission control
      </Link>
    </main>
  );
}
