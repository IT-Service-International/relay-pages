(() => {
  "use strict";

  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");
  const form = document.getElementById("terminal-form");

  if (!output || !input || !form) return;

  // RELAY Virtual Filesystem v1.4
  const fs = {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          n0hup: {
            type: "dir",
            children: {
              "readme.txt": {
                type: "file",
                content:
                  "RELAY Operating Environment\n" +
                  "Callsign: RLY-01\n" +
                  "Handle: n0hup\n" +
                  "The session ends. The purpose does not."
              },
              "contact.txt": {
                type: "file",
                content:
                  "SECURE: n0hup@proton.me\n" +
                  "GENERAL: n0hup.relay@gmail.com"
              },
              about: {
                type: "dir",
                children: {
                  "identity.txt": {
                    type: "file",
                    content:
                      "RELAY / RLY-01\n" +
                      "Unix. Signals. Systems. Resilience.\n" +
                      "Independent by design."
                  }
                }
              },
              philosophy: {
                type: "dir",
                children: {
                  "manifesto.txt": {
                    type: "file",
                    content:
                      "THE RELAY MANIFESTO\n\n" +
                      "Connection lost. Mission continues.\n\n" +
                      "A relay preserves the signal.\n" +
                      "A resilient system preserves the mission.\n\n" +
                      "The session ends. The purpose does not."
                  },
                  "principles.txt": {
                    type: "file",
                    content:
                      "I.   Continuity over visibility.\n" +
                      "II.  Understanding over authority.\n" +
                      "III. Resilience over perfection.\n" +
                      "IV.  Precision over noise.\n" +
                      "V.   Purpose beyond connection."
                  }
                }
              },
              notes: {
                type: "dir",
                children: {
                  "unix.txt": {
                    type: "file",
                    content:
                      "UNIX NOTES\n\n" +
                      "Keep systems simple.\n" +
                      "Understand your tools.\n" +
                      "Prefer readable configurations.\n" +
                      "Document what matters."
                  },
                  "signals.txt": {
                    type: "file",
                    content:
                      "SIGNALS\n\n" +
                      "A signal is only useful when received.\n" +
                      "Verify the channel.\n" +
                      "Preserve the message.\n" +
                      "Maintain a fallback."
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const home = "/home/n0hup";
  let cwd = home;
  const history = [];
  let historyPos = 0;
  const started = Date.now();

  function nodeAt(path) {
    const parts = path.split("/").filter(Boolean);
    let node = fs;

    for (const part of parts) {
      if (node.type !== "dir") return null;
      node = node.children[part];
      if (!node) return null;
    }
    return node;
  }

  function resolve(path = ".") {
    let parts = path.startsWith("/")
      ? []
      : cwd.split("/").filter(Boolean);

    const requested = path === "~"
      ? home
      : path.startsWith("~/")
        ? home + path.slice(1)
        : path;

    if (requested.startsWith("/")) parts = [];

    for (const item of requested.split("/")) {
      if (!item || item === ".") continue;
      if (item === "..") parts.pop();
      else parts.push(item);
    }

    return "/" + parts.join("/");
  }

  function displayPath() {
    if (cwd === home) return "~";
    if (cwd.startsWith(home + "/"))
      return "~" + cwd.slice(home.length);
    return cwd;
  }

  function prompt() {
    return "n0hup@relay:" + displayPath() + "$ ";
  }

  function print(text = "", className = "") {
    const line = document.createElement("div");
    line.className = "terminal-line " + className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function tree(node, prefix = "", depth = 0) {
    if (depth > 8 || node.type !== "dir") return [];

    const entries = Object.entries(node.children);
    const result = [];

    entries.forEach(([name, child], index) => {
      const last = index === entries.length - 1;
      result.push(prefix + (last ? "└── " : "├── ") +
        name + (child.type === "dir" ? "/" : ""));

      if (child.type === "dir") {
        result.push(...tree(
          child,
          prefix + (last ? "    " : "│   "),
          depth + 1
        ));
      }
    });

    return result;
  }


  // RELAY v1.6 — Read published files

  async function readPublishedFile(path) {
    try {
      print("Connecting to RELAY archive...");

      const response = await fetch(path, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const content = await response.text();

      print(
        content || "[EMPTY FILE]",
        "archive-content"
      );

    } catch (error) {
      print(
        "relay-sh: unable to read archive: " +
        error.message,
        "error"
      );
    }
  }

  // RELAY v1.7 — Published notes index

  async function listPublishedNotes() {
    try {
      const response = await fetch("/notes/index.json", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data.notes)) {
        throw new Error("Invalid notes index");
      }

      const names = data.notes
        .filter(item =>
          typeof item.name === "string" &&
          /^[a-z0-9_-]+\.txt$/i.test(item.name)
        )
        .map(item => item.name);

      print(names.join("  ") || "[NO NOTES]");

    } catch (error) {
      print(
        "relay-sh: notes index unavailable: " +
        error.message,
        "error"
      );
    }
  }

  
  function execute(raw) {
    const args = raw.trim().split(/\s+/);
    const command = (args.shift() || "").toLowerCase();
    const argument = args.join(" ");

    if (!command) return;
    if (command === "clear") {
      output.replaceChildren();
      return;
    }

    print(prompt() + raw, "command");

    switch (command) {


      case "services":
        window.location.assign("services.html");
        break;

      case "tailored":
        window.location.assign("tailored.html");
        break;

      case "request":
        window.location.assign("tailored.html#request");
        break;

      case "journal":
        readPublishedFile("/logs/relay.log");
        break;

      case "notes":
        print("Opening RELAY Technical Notes...");
        window.location.assign("/notes/");
        break;


      case "motd":
        readPublishedFile("/system/motd.txt");
        break;

      case "version":
        readPublishedFile("/system/version.txt");
        break;

        
      case "help":
        print(
          "RELAY COMMAND REFERENCE\n\n" +
          " help          Available commands\n" +
          " services      Open engineering services\n" +
          " tailored      Open tailored solutions\n" +
          " request       Prepare a project request\n" +
          " pwd           Current directory\n" +
          " ls [path]     List files\n" +
          " ls -la        Detailed listing\n" +
          " cd [path]     Change directory\n" +
          " tree [path]   Directory tree\n" +
          " cat <file>    Read file\n" +
          " grep X FILE   Search file text\n" +
          " whoami        Operator identity\n" +
          " status        System status\n" +
          " uname         Environment\n" +
          " neofetch      ASCII identity\n" +
          " uptime        Session uptime\n" +
          " date          Local browser time\n" +
          " contact       Contact information\n" +
          " manifesto     Open manifesto.html\n" +
          " history       Command history\n" +
          " journal       Read live operator log\n" +
          " notes         Open technical notes\n" +
          " ls notes      List published notes\n" +
          " cat notes/X   Read published note\n" +
          " motd          Read message of the day\n" +
          " version       Show RELAY version\n" +
          " clear         Clear screen"
        );
        break;


        
      case "pwd":
        print(cwd);
        break;

      case "ls": {
        
        if (
          args.length === 1 &&
          (args[0] === "notes" || args[0] === "notes/")
        ) {
          listPublishedNotes();
          break;
        }

        const detailed = args.includes("-la") ||
                         args.includes("-al") ||
                         args.includes("-l");
        const target = args.find(a => !a.startsWith("-")) || ".";
        const node = nodeAt(resolve(target));

        if (!node) {
          print("ls: no such file or directory: " + target, "error");
        } else if (node.type === "file") {
          print(target);
        } else {
          const entries = Object.entries(node.children);
          if (detailed) {
            print("drwxr-xr-x  n0hup  .");
            print("drwxr-xr-x  n0hup  ..");
            for (const [name, child] of entries) {
              const mode = child.type === "dir"
                ? "drwxr-xr-x"
                : "-rw-r--r--";
              print(mode + "  n0hup  " + name);
            }
          } else {
            print(entries.map(([name, child]) =>
              name + (child.type === "dir" ? "/" : "")
            ).join("  "));
          }
        }
        break;
      }

      case "cd": {
        const target = args[0] || "~";
        const path = resolve(target);
        const node = nodeAt(path);

        if (!node) {
          print("cd: no such directory: " + target, "error");
        } else if (node.type !== "dir") {
          print("cd: not a directory: " + target, "error");
        } else {
          cwd = path;
        }
        break;
      }

      case "tree": {
        const target = args[0] || ".";
        const node = nodeAt(resolve(target));
        if (!node) {
          print("tree: path not found: " + target, "error");
        } else if (node.type === "file") {
          print(target);
        } else {
          print(target + "\n" + tree(node).join("\n"));
        }
        break;
      }

      case "cat": {

        
        if (
          argument === "notes/unix.txt" ||
          argument === "notes/signals.txt" ||
          argument === "/notes/unix.txt" ||
          argument === "/notes/signals.txt"
        ) {
          const filename = argument.split("/").pop();
          readPublishedFile("/notes/" + filename);
          break;
        }

        if (
          argument === "system/motd.txt" ||
          argument === "/system/motd.txt" ||
          argument === "system/version.txt" ||
          argument === "/system/version.txt"
        ) {
          const filename = argument.split("/").pop();
          readPublishedFile("/system/" + filename);
          break;
        }


        if (
          argument === "/logs/relay.log" ||
          argument === "logs/relay.log"
        ) {
          readPublishedFile("/logs/relay.log");
          break;
        }


        
        if (!argument) {
          print("usage: cat <file>", "error");
          break;
        }
        const node = nodeAt(resolve(argument));
        if (!node) {
          print("cat: file not found: " + argument, "error");
        } else if (node.type !== "file") {
          print("cat: is a directory: " + argument, "error");
        } else {
          print(node.content);
        }
        break;
      }

      case "grep": {
        if (args.length < 2) {
          print("usage: grep <pattern> <file>", "error");
          break;
        }
        const pattern = args[0];
        const filename = args[1];
        const node = nodeAt(resolve(filename));

        if (!node || node.type !== "file") {
          print("grep: invalid file: " + filename, "error");
        } else {
          const matches = node.content.split("\n")
            .filter(line =>
              line.toLowerCase().includes(pattern.toLowerCase())
            );
          if (matches.length) print(matches.join("\n"));
        }
        break;
      }

      case "whoami":
        print("n0hup / RELAY / RLY-01");
        break;

      case "status":
        print(
          "RELAY: OPERATIONAL\n" +
          "ENVIRONMENT: BROWSER SIMULATION\n" +
          "VIRTUAL FILESYSTEM: READY\n" +
          "EXTERNAL CONNECTIVITY: NOT MONITORED"
        );
        break;

      case "uname":
        print("RELAY Virtual Unix / relay-sh 1.4");
        break;

      case "date":
        print(new Date().toString());
        break;

      case "uptime": {
        const seconds = Math.floor((Date.now() - started) / 1000);
        print("session uptime: " + seconds + " seconds");
        break;
      }

      case "neofetch":
        print(
          "       [RLY-01]       n0hup@relay\n" +
          "         ||           -----------\n" +
          "      ---||---        ID: RELAY\n" +
          "         ||           Shell: relay-sh\n" +
          "        /  \\          Version: 1.4\n" +
          "       /____\\         Mode: Virtual\n" +
          "                      Status: Operational"
        );
        break;

      case "contact":
        print(
          "SECURE: n0hup@proton.me\n" +
          "GENERAL: n0hup.relay@gmail.com"
        );
        break;

      case "manifesto":
        window.location.assign("manifesto.html");
        break;

      case "history":
        print(history.map((c, i) =>
          `${i + 1}  ${c}`
        ).join("\n"));
        break;

      default:
        print(
          "relay-sh: command not found: " + command,
          "error"
        );
        print("Type 'help' for available commands.");
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    history.push(value);
    historyPos = history.length;
    input.value = "";
    execute(value);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      historyPos = Math.max(0, historyPos - 1);
      input.value = history[historyPos] || "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyPos = Math.min(history.length, historyPos + 1);
      input.value = history[historyPos] || "";
    }
  });

  print(
    "RELAY OPERATING ENVIRONMENT\n" +
    "RLY-01 / VIRTUAL UNIX SHELL\n" +
    "-----------------------------------\n" +
    "Connection lost. Mission continues.\n" +
    "Type 'help' to begin.\n" +
    "-----------------------------------"
  );
})();
