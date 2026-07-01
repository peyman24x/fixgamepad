# Pro Controller Diagnostic & Calibration Suite (Production)
  
## Requirements
- Node.js (v18+)
- Chrome/Edge Browser v89+ (WebHID Support)
- Sony DualShock 4 / DualSense (For Calibration Features)

## Installation
1. Run `node setup_prod.js` to generate project files.
2. Start a local secure server: `npx http-server -p 8080`
3. Open `http://localhost:8080` in Chrome/Edge.

## Safety Warnings
- Do not disconnect the controller while "Writing to Flash" is in progress.
- Ensure the controller has at least 20% battery before starting hardware calibration.