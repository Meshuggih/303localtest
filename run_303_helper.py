# run_303_helper.py
#
# Script Python pour lancer le TB-303/TD-3 Helper en local.
# Il démarre un serveur HTTP local dans le dossier courant
# (là où se trouvent index.html, style.css, app.js)
# puis ouvre la webapp dans le navigateur par défaut.
#
# Améliorations par rapport à l'original (fix pour Pythonista/iOS) :
# - Cross-platform (fonctionne sur Python 3.x desktop, Pythonista, etc.)
# - Vérification stricte des 3 fichiers essentiels
# - Port auto-détecté avec fallback configurable
# - Logs optionnels (désactivés par défaut pour silence)
# - Gestion d'erreurs améliorée (e.g., si browser échoue)
# - Option --port pour forcer un port spécifique
# - Arrêt propre du serveur via Ctrl+C (main thread only, fix pour threads)
# - Messages en français, avec emojis pour clarté
# - Fix signal: Événement stop_event géré en main, pas de signal dans thread
#
# Usage: python run_303_helper.py [--port 8080]

import os
import sys
import argparse
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import socket
import time


class QuietHandler(SimpleHTTPRequestHandler):
    """Handler HTTP silencieux (pas de logs console)."""
    def log_message(self, format, *args):
        pass  # Commentez pour activer les logs de debug


def find_free_port(start=8000, end=9000):
    """Trouve un port libre entre start et end inclus."""
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"Aucun port libre trouvé entre {start} et {end}")


def verify_files(base_dir):
    """Vérifie la présence des 3 fichiers essentiels."""
    required_files = ["index.html", "style.css", "app.js"]
    missing = []
    for fname in required_files:
        if not os.path.exists(os.path.join(base_dir, fname)):
            missing.append(fname)
    if missing:
        print(f"❌ Fichiers manquants dans '{base_dir}' : {', '.join(missing)}")
        print("💡 Placez ce script dans le même dossier que index.html, style.css et app.js.")
        return False
    print(f"✅ Fichiers vérifiés : {', '.join(required_files)}")
    return True


def run_server(port, directory, stop_event):
    """Lance le serveur HTTP dans directory sur port."""
    os.chdir(directory)
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, QuietHandler)
    httpd.timeout = 0.5
    print(f"🌐 Serveur démarré sur http://127.0.0.1:{port}/")
    print(f"📁 Dossier servi : {directory}")
    
    # Boucle serveur jusqu'à stop_event (sans signal dans thread)
    while not stop_event.is_set():
        httpd.handle_request()
    
    httpd.server_close()
    print("👋 Serveur arrêté.")


def open_browser(url):
    """Ouvre l'URL dans le navigateur par défaut, avec fallback."""
    try:
        if webbrowser.open(url):
            print(f"🖥️  Webapp ouverte dans le navigateur : {url}")
        else:
            print(f"⚠️  Échec ouverture navigateur. Ouvrez manuellement : {url}")
    except Exception as e:
        print(f"❌ Erreur ouverture navigateur : {e}")
        print(f"💡 Ouvrez manuellement : {url}")


def main():
    parser = argparse.ArgumentParser(description="Lanceur du TB-303/TD-3 Helper en local.")
    parser.add_argument("--port", type=int, help="Port spécifique (défaut : auto entre 8000-9000)")
    args = parser.parse_args()

    # Dossier courant (où est ce script)
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        base_dir = os.getcwd()

    # Vérification fichiers
    if not verify_files(base_dir):
        sys.exit(1)

    # Port
    if args.port:
        port = args.port
        # Vérif si port libre
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
            except OSError:
                print(f"❌ Port {port} déjà utilisé. Choisissez un autre.")
                sys.exit(1)
    else:
        try:
            port = find_free_port()
        except RuntimeError as e:
            print(f"❌ {e}")
            sys.exit(1)

    # Événement pour arrêt serveur
    stop_event = threading.Event()

    # Thread serveur
    server_thread = threading.Thread(
        target=run_server,
        args=(port, base_dir, stop_event),
        daemon=True
    )
    server_thread.start()

    # Attendre un peu pour que le serveur démarre
    time.sleep(0.5)

    # Ouvrir navigateur
    url = f"http://127.0.0.1:{port}/index.html"
    open_browser(url)

    # Attendre l'arrêt (bloquant, Ctrl+C pour quitter) - géré en main thread
    try:
        while server_thread.is_alive():
            server_thread.join(timeout=0.5)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur demandé...")
        stop_event.set()
        while server_thread.is_alive():
            server_thread.join(timeout=0.5)
        print("👋 Script terminé.")


if __name__ == "__main__":
    main()
