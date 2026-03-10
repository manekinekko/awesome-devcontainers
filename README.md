# Awesome Dev Containers [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

<div id="top"></div>
<br />
<div align="center">
  <a href="https://github.com/manekinekko/awesome-devcontainers">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>
  <p align="center">
    A curated list of awesome tools and resources about <a href="https://code.visualstudio.com/docs/remote/containers">dev containers</a> for common programming languages <br /> and technology stacks to boost your developer productivity 🚀
    <br />
    <br />
    <a href="https://github.com/manekinekko/awesome-devcontainers/issues">Report an issue</a>
    ·
    <a href="https://github.com/manekinekko/awesome-devcontainers/issues">Add a resource</a>
  </p>
</div>

## Contents

- [Tools](#tools)
- [Articles](#articles)
- [Tutorials](#tutorials)
- [Videos](#videos)
- [Samples](#samples)
  - [C/C++](#cc)
  - [Go](#go)
  - [Java](#java)
  - [.NET](#net)
  - [Node.js](#nodejs)
  - [PHP](#php)
  - [Python](#python)
  - [Ruby](#ruby)
  - [Rust](#rust)
  - [Misc](#misc)

## Tools

- [VS Code Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) - An extension pack that lets you open any folder in a container, on a remote machine, or in WSL and take advantage of VS Code's full feature set.
- [Unofficial devcontainer CLI](https://github.com/stuartleeks/devcontainer-cli) - An experimental CLI to improve the experience of working with Visual Studio Code dev containers.
- [devcontainer-build-run](https://github.com/stuartleeks/devcontainer-build-run) - A GitHub action and Azure DevOps task aimed at making it easier to re-use a Visual Studio Code devcontainer in a GitHub workflow or Azure DevOps pipeline.
- [vscli](https://github.com/michidk/vscli) - A CLI/TUI which makes it easy to launch vscode projects from the terminal, with a focus on dev containers. Also supports projects with multiple dev containers.
- 👔 [tyedev](https://github.com/CodeMan99/tyedev) - Improve Devcontainer Creation - An interactive experience for the creation of a devcontainer. Provides ability to search for [features](https://containers.dev/features) and [templates](https://containers.dev/templates). And more!
- [Pieces](https://pieces.app/) — An on-device copilot that helps you capture, enrich, and reuse code, streamline collaboration, and solve complex problems through a contextual understanding of your workflow.

<p align="right">(<a href="#top">back to top</a>)</p>

## Articles

- [Developing inside a Container](https://code.visualstudio.com/docs/remote/containers) - Visual Studio Code Remote Containers official documentation.
- [Your open source project needs a dev container. Here is why](https://www.aaron-powell.com/posts/2021-03-08-your-open-source-project-needs-a-dev-container-heres-why/) - Dev containers are awesome, we can use them to define an isolated development environment within Docker that has all that we need, and only what we need, installed in it.
- [Instantly set up a new dev environment using containers and VS Code](https://dev.to/itnext/instantly-set-up-a-new-dev-environment-using-containers-and-vs-code-51g8) - Discover how to get started in seconds on a new project, isolate all your dev environments and share them with your teammates using VS Code dev containers.
- [Development Containers in Education: A Guide for Instructors](https://code.visualstudio.com/blogs/2020/07/27/containers-edu) - Development containers with Visual Studio Code can serve as a fantastic tool in education to ensure students have a consistent coding environment. They take care of setup so that students and instructors can quickly move past configuration, and instead focus on what's truly important: learning and coding something great!
- [Using Remote Containers in WSL 2](https://code.visualstudio.com/blogs/2020/07/01/containers-wsl) - See how you can use remote containers in Windows Subsystem for Linux 2 (WSL 2).
- [Advanced tips from Microsoft's CSE team for Dev Containers](https://microsoft.github.io/code-with-engineering-playbook/developer-experience/going-further/) - A list of tips to enhance your Dev Containers to support Apple M1, include various tooling and customizations.

<p align="right">(<a href="#top">back to top</a>)</p>

## Tutorials

- [Use a Docker container as a development environment with Visual Studio Code](https://docs.microsoft.com/en-us/learn/modules/use-docker-container-dev-env-vs-code/?WT.mc_id=devcloud-11496-cxa) - Get, create, and configure a container-based development environment with the Visual Studio Code Remote - Containers extension.

<p align="right">(<a href="#top">back to top</a>)</p>

## Videos

- [GitHub Codespaces - A Game Changer](https://www.youtube.com/watch?v=B_gtLXvDQhE) - In this demo, Alvaro Videla makes the RabbitMQ tutorials "Codespaces ready" and ran them directly from the browser without the need to install RabbitMQ or Node.js.
- [Remote Development with Visual Studio Code](https://www.youtube.com/watch?v=sakjpegUQsk) - In this session, Brigit Murtaugh demos how to use the VS Code Remote extensions to connect to remote environments and build and deploy applications using the same, familiar Visual Studio Code you already know locally.
- [A clean dev env, working every time, everywhere](https://www.youtube.com/watch?v=NNrq2641zTA) - In this session, Yohan Lasorsa demos how to isolate each of your projects' environment, and share it with your teammates to quickly onboard newcomers.
- [Beginner's Series to: Dev Containers](https://docs.microsoft.com/shows/beginners-series-to-dev-containers/) - A series of videos about dev containers in Visual Studio Code! We'll show you how to get, create, and configure a container-based development environment with the VS Code Remote - Containers extension.
- [Visual Studio Code Development Containers: A Guide for Students](https://www.youtube.com/watch?v=Uvf2FVS1F8k) - In this video, check out how you can get started with a VS Code dev container in just 5 minutes as a student.

<p align="right">(<a href="#top">back to top</a>)</p>

## Samples

### C/C++

- [Try Out Development Containers: C++](https://github.com/microsoft/vscode-remote-try-cpp) - C++ sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [C++ image](https://github.com/devcontainers/images/tree/main/src/cpp) - Develop C++ applications on Linux. Includes Debian C++ build tools (maintained by Microsoft).

### Go

- [Go Dev Container](https://github.com/qdm12/godevcontainer) - Ultimate Go development container for Visual Studio Code.
- [Try Out Development Containers: Go](https://github.com/microsoft/vscode-remote-try-go) - Go sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [Go image](https://github.com/devcontainers/images/tree/main/src/go) - Develop Go based applications. Includes appropriate runtime args, Go, common tools, extensions, and dependencies (maintained by Microsoft).

### Java

- [Try Out Development Containers: Java](https://github.com/microsoft/vscode-remote-try-java) - Java sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [Java image](https://github.com/devcontainers/images/tree/main/src/java) - Develop Java applications. Includes the JDK and Java extensions (maintained by Microsoft).

### .NET

- [Try Out Development Containers: .NET Core](https://github.com/microsoft/vscode-remote-try-dotnetcore) - .NET Core sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [.NET image](https://github.com/devcontainers/images/tree/main/src/dotnet) - Develop C# and .NET based applications. Includes all needed SDKs, extensions, and dependencies (maintained by Microsoft).

### Node.js

- [Try Out Development Containers: Node.js](https://github.com/microsoft/vscode-remote-try-node) - Node.js sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [Node.js image w/ JavaScript](https://github.com/devcontainers/images/tree/main/src/javascript-node) - Develop Node.js based applications. Includes Node.js, eslint, nvm, and yarn (maintained by Microsoft).
- [Node.js image w/ TypeScript](https://github.com/devcontainers/images/tree/main/src/typescript-node) - Develop Node.js based applications in TypeScript. Includes Node.js, eslint, nvm, yarn, and the TypeScript compiler (maintained by Microsoft).

### PHP

- [Try Out Development Containers: PHP](https://github.com/microsoft/vscode-remote-try-php) - PHP sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [PHP image](https://github.com/devcontainers/images/tree/main/src/php) - Develop PHP based applications. Includes needed tools, extensions, and dependencies (maintained by Microsoft).

### Python

- [Try Out Development Containers: Python](https://github.com/microsoft/vscode-remote-try-python) - Python sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [Python image](https://github.com/devcontainers/images/tree/main/src/python) - Develop Python 3 applications (maintained by Microsoft).
- [Python Project Template](https://github.com/pamelafox/python-project-template): A Dev Container with support for black, isort, ruff, pre-commit, pytest
- [SQLAlchemy SQLIte Playground](https://github.com/pamelafox/sqlalchemy-sqlite-playground): Dev Container with SQLAlchemy package, SQLTools extension
- [PostgreSQL playground](https://github.com/pamelafox/postgresql-playground): Similar to the SQLite playground, but includes local PostgreSQL setup in Dev Container
- [PostgreSQL + pgvector playground](https://github.com/pamelafox/pgvector-playground): Dev Container with PostgreSQL, pgvector extension, and multiple pgvector Python examples
- [python 3.10 playground](https://github.com/pamelafox/python-3.10-playground): A simple 3.10 Dev Container
- [python 3.11 playground](https://github.com/pamelafox/python-3.11-playground): A simple 3.11 Dev Container
- [python 3.12 playground](https://github.com/pamelafox/python-3.12-playground): A simple 3.12 Dev Container

### Ruby

- [Try Out Development Containers: Ruby](https://github.com/devcontainers/images/tree/main/src/ruby) - Ruby sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).

### Rust

- [Try Out Development Containers: Rust](https://github.com/microsoft/vscode-remote-try-rust) - Rust sample project for trying out the VS Code Remote - Containers extension (maintained by Microsoft).
- [Rust image](https://github.com/devcontainers/images/tree/main/src/rust) - Develop Rust based applications. Includes appropriate runtime args and everything you need to get up and running (maintained by Microsoft).

### Misc

- [ROS dev container for VS Code](https://github.com/devrt/ros-devcontainer-vscode) - A preconfigured docker image for ROS (Robot Operating System) development. Preconfigured code completion for C++, Python, XML (package.xml, launchfiles, URDF, SDF). Preconfigured simulation environments (Flatland, TurtleBot3, ARIAC, Virtual RobotX, UUV).

<p align="right">(<a href="#top">back to top</a>)</p>
