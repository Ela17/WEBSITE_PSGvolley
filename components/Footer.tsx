import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* Info Squadra */}
                <div>
                    <h3 className="font-bold text-lg mb-2">A.S.D. Patrocinio San Giuseppe</h3>
                    <p className="text-gray-400 text-sm">Campionato UISP 4+2 e 3x3</p>
                    <p className="text-gray-400 text-sm">Stagione 2025/26</p>
                </div>

                {/* Sponsor */}
                <div className="text-center">
                    <p className="text-sm text-gray-400 mb-3">Il nostro sponsor:</p>
                    <Link 
                    href="https://www.patago.it/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                    >
                    <Image 
                        src="images/logos/patago.svg" 
                        alt="Sponsor" 
                        width={150} 
                        height={80} 
                        className="object-contain"
                    />
                    </Link>
                </div>

                {/* Contatti Social */}
                <div className="text-center md:text-right">
                    <h3 className="font-bold text-lg mb-3">Seguici</h3>
                    <Link 
                    href="https://www.instagram.com/asd_patrociniosgiuseppe/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                    <FaInstagram className="w-6 h-6" />
                    <span>@asd_patrociniosgiuseppe</span>
                    </Link>
                </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} ASD Patrocinio San Giuseppe. Tutti i diritti riservati.</p>
                </div>
            </div>
        </footer>
    );
}