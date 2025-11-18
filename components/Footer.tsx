import Image from "next/image";
import Link from "next/link";
import {
  FaInstagram,
  FaDirections,
  FaRegCopyright,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Colonna 1: Info */}
          <div>
            <h3 className="font-bold text-lg mb-0">
              A.S.D. Patrocinio San Giuseppe
            </h3>
            <h4 className="font-bold text-md mb-3">
              Squadre di pallavolo mista
            </h4>

            {/* Indirizzo inline */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">Dove trovarci:</span>
              <a
                href="https://www.google.com/maps/place/Via+Pietro+Baiardi,+4,+10126+Torino+TO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span className="group-hover:underline">
                  Via Pietro Baiardi 4, Torino
                </span>
                <FaDirections className="text-blue-400 group-hover:text-blue-300" />
              </a>
            </div>

            {/* Instagram inline */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Seguici:</span>
              <Link
                href="https://www.instagram.com/asd_patrocinosgiuseppe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
                <span className="text-sm">@asd_patrocinosgiuseppe</span>
              </Link>
            </div>
          </div>

          {/* Colonna 2: Sponsor */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400 mb-2">Sponsorizzato da:</p>
            <Link
              href="https://www.patago.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/logos/patago.svg"
                alt="Sponsor Patago"
                width={140}
                height={70}
                className="object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm text-gray-400">
          <p className="inline-flex items-center">
            <FaRegCopyright className="align-middle mr-1" />
            {new Date().getFullYear()} ASD Patrocinio San Giuseppe. Tutti i
            diritti riservati.
          </p>
          <p className="mt-1">
            Sviluppato da Elena Derosas.
            <a
              href="https://github.com/Ela17"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaGithub className="w-4 h-4 mr-1" />
              Ela17
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
