"""Publish the source CSS adjustment through Nginx without restarting Waxum."""
from datetime import datetime, timezone
from pathlib import Path
import os
import shutil
import subprocess
import sys

source, site = map(Path, sys.argv[1:])
assert os.geteuid() == 0, "Run as root on the dedicated host"
original = site.read_text()
assert "proxy_pass" not in original and "snippets/waxum-proxy.conf" in original
assert "listen 443 ssl" in original
start = "/* BEGIN console-session-names:"
end = "/* END console-session-names */"
css = source.read_text()
assert css.count(start) == css.count(end) == 1
css = css[css.index(start):css.index(end) + len(end)] + "\n"
marker = "    # BEGIN console-session-names\n"
assert marker not in original, "Already installed; inspect before changing it"
anchor = "    location = /metrics {"
assert original.count(anchor) == 1
block = '''    # BEGIN console-session-names
    location = /assets/console-session-names.css {
        alias /var/www/waxum-console/console-session-names.css;
        default_type text/css;
        expires -1;
    }
    location = / {
        include snippets/waxum-proxy.conf;
        proxy_set_header Accept-Encoding "";
        sub_filter '<link rel="stylesheet" href="/assets/console.css">' '<link rel="stylesheet" href="/assets/console.css"><link rel="stylesheet" href="/assets/console-session-names.css">';
        sub_filter_once on;
    }
    # END console-session-names

'''
backup = Path("/opt/waxum/rollback") / ("console-session-names-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
backup.mkdir(parents=True, mode=0o700)
shutil.copy2(site, backup / "nginx-site.conf")
asset = Path("/var/www/waxum-console/console-session-names.css")
assert not asset.exists(), "Unexpected existing stylesheet; inspect first"
asset.parent.mkdir(mode=0o755, exist_ok=True)
asset.write_text(css)
asset.chmod(0o644)
try:
    site.write_text(original.replace(anchor, block + anchor))
    subprocess.run(["nginx", "-t"], check=True)
    subprocess.run(["systemctl", "reload", "nginx"], check=True)
except Exception:
    site.write_text(original)
    subprocess.run(["nginx", "-t"], check=True)
    subprocess.run(["systemctl", "reload", "nginx"], check=True)
    raise
print("Console stylesheet enabled; Waxum was not restarted. Rollback:", backup)
