const r = require('raylib')
const FluidSynth = require('./fluid.js')

r.SetTraceLogLevel(r.LOG_ERROR)
r.InitWindow(640, 480, 'FluidRay')

// this can mess up timing if you do async stuff
// r.SetTargetFPS(60)

while (!r.WindowShouldClose()) {
  r.BeginDrawing()
  r.ClearBackground(r.BLACK)
  // r.DrawText('Congrats! You created your first node-raylib window!', 45, 200, 20, r.WHITE)
  r.EndDrawing()
}

r.CloseWindow()
