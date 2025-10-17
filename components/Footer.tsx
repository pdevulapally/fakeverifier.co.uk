export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-gray-500 flex items-center justify-between">
        <p>© {new Date().getFullYear()} FakeVerifier. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-700">Privacy</a>
          <a href="#" className="hover:text-gray-700">Terms</a>
        </div>
      </div>
    </footer>
  );
}


