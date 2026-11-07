
(() => {
  "use strict";

  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");
  const form = document.getElementById("terminal-form");

  if (!output || !input || !form) return;

  const commands = [];
  let position = 0;

  const files = {
    "identity.txt":
      "HANDLE: n0hup\nCALLSIGN: RELAY\nID: RLY-01\nSTATUS: OPERATIONAL",
    "philosophy.txt":
      "The session ends. The purpose does not.\n\n" +
      "Continuity over visibility.\n" +
      "Understanding over authority.\n" +
      "Resilience over perfection.\n" +
      "Precision over noise.",
    "contact.txt":
      "SECURE: n0hup@proton.me\n" +
      "GENERAL: n0hup.relay@gmail.com",
    "readme.txt":
      "RELAY Operating Environment\n" +
      "A tribute to Unix and the independent Internet."
  };

  function print(text, className = "") {
    const line = document.createElement("div");
    line.className = "terminal-line " + className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function execute(raw) {
    const parts = raw.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (!command) return;

    print("n0hup@relay:~$ " + raw, "command");

    switch (command) {
      case "help":
        print(
          "Available commands:\n\n" +
          " help       Show available commands\n" +
          " whoami     Show operator identity\n" +
          " status     Show RELAY status\n" +
          " uname      Show environment\n" +
          " date       Show local time\n" +
          " ls         List virtual files\n" +
          " cat FILE   Read a virtual file\n" +
          " neofetch   Display identity\n" +
          " manifesto  Open the manifesto\n" +
          " contact    Contact information\n" +
          " history    Command history\n" +
          " clear      Clear terminal"
        );
        break;

      case "whoami":
        print("n0hup / RELAY / RLY-01");
        print("Unix. Signals. Systems. Resilience.");
        break;

      case "status":
        print(
          "RELAY: OPERATIONAL\n" +
          "MODE: STANDALONE\n" +
          "ENVIRONMENT: BROWSER\n" +
          "NETWORK STATUS: NOT MONITORED"
        );
        break;

      case "uname":
        print("RELAY Browser Shell / RLY-01");
        break;

      case "date":
        print(new Date().toString());
        break;

      case "ls":
        print(Object.keys(files).join("  ") + "  manifesto.html");
        break;

      case "cat":
        if (Object.hasOwn(files, arg)) {
          print(files[arg]);
        } else {
          print("cat: file not found: " + (arg || "(missing filename)"), "error");
        }
        break;

      case "neofetch":
        print(
          "     [RLY-01]      n0hup@relay\n" +
          "       ||          ------------\n" +
          "    ---||---       ID: RELAY\n" +
          "       ||          OS: Browser Shell\n" +
          "      /  \\         Shell: relay-sh\n" +
          "     /____\\        Mission: Continuity\n" +
          "                    Status: Operational"
        );
        break;

      case "manifesto":
        print("Opening RELAY Manifesto...");
        window.location.assign("manifesto.html");
        break;

      case "contact":
        print(
          "SECURE: n0hup@proton.me\n" +
          "GENERAL: n0hup.relay@gmail.com"
        );
        break;

      case "history":
        print(commands.map((c, i) => `${i + 1}  ${c}`).join("\n"));
        break;

      case "clear":
        output.replaceChildren();
        break;

      default:
        print("relay-sh: command not found: " + command, "error");
        print("Type 'help' for available commands.");
    }

    output.scrollTop = output.scrollHeight;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    commands.push(value);
    position = commands.length;
    input.value = "";
    execute(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      position = Math.max(0, position - 1);
      input.value = commands[position] || "";
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      position = Math.min(commands.length, position + 1);
      input.value = commands[position] || "";
    }
  });

  print("RELAY Operating Environment / RLY-01");
  print("Connection lost. Mission continues.");
  print("Type 'help' to begin.");
})();
