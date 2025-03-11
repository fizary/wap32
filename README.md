> ### WORK IN PROGRESS

Recreation of Monolith's WAP32 game engine in web technologies.

## Example usage

```typescript
import { BinaryStream } from "hexcod";
import { RezManager } from "wap32/rez";
import { parsePid } from "wap32/pid";

// Create stream from ArrayBuffer containing REZ file
const stream = new BinaryStream(buffer);

// Create RezManager and use it to retrieve some image file
const manager = new RezManager(stream);
const entry = manager.getEntry("/CLAW/IMAGES/FRAME163.PID");

// Check if entry and its content were retrieved successfully
if (entry && entry.type === "file" && entry.content) {
    // Parse entry content
    const { header, pixelData, palette } = parsePid(entry.content, entry.content.view.byteLength);

    // Do whatever you want with parsed PID data
}
```

## Installation

This package is not published in any registry and requires manual installation.

### 1. Prerequirements

This package heavily relies on [fizary/hexcod](https://github.com/fizary/hexcod) package that is not published and requires manual installation.
Please follow first step of installation process from that package first.

Both hexcod and this package should be colocated in same parent directory (eg. projects/hexcod and projects/wap32).

### 2. Clone and compile source

```bash
# Clone repository
git clone https://github.com/fizary/wap32.git
cd wap32

# READ PREREQUIREMENTS BEFORE INSTALLING DEPENDENCIES
# Install dependencies
npm i

# Compile source code
npm run build
```

### 3. Installation from local source

There are couple ways to install dependencies from local source.

#### Install from directory (recommended)

```bash
# Use `file:` protocol with path to directory you want to install, eg.
npm i file:../wap32
```

**Important!** Make sure directory you want to install is located outside of your project's root directory to avoid installing and hoisting it's dependencies to your project's node_modules.

#### Install from tarball

```bash
# Run this command in library's root directory to create tarball
npm pack

# You can move this tarball to any location, in this example we will move it to parent directory
mv wap32-0.0.0.tgz ../wap32-0.0.0.tgz

# Then we go to our project's root directory
cd ../my-project

# And finally install the dependency
npm i ../wap32-0.0.0.tgz
```
