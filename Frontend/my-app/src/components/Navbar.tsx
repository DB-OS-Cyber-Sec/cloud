import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={40} height={40}></Image>
            <Link href="/" className="text-white font-bold text-lg">WeatherGuard</Link>
          </div>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
            </li>
            <li>
              <Link href="/notifications" className="text-gray-300 hover:text-white">Notifications</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
}