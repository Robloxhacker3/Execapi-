const express = require('express');
const { lua } = require('fengari');
const { to_luastring } = require('fengari').lua;
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to execute Lua code or loadstring from the URL query parameters
app.get('/execute-lua', (req, res) => {
  const { execute, loadstring } = req.query;

  // Check if 'execute' or 'loadstring' query parameter is present
  if (!execute && !loadstring) {
    return res.status(400).json({ error: 'No Lua code provided in query parameter' });
  }

  const luaCode = execute || loadstring;  // Get the Lua code from the appropriate query parameter

  try {
    // Execute Lua code using fengari
    const L = lua.luaL_newstate();
    lua.luaL_openlibs(L);

    // Run the Lua code
    const result = lua.luaL_dostring(L, to_luastring(luaCode));
    if (result !== 0) {
      return res.status(500).json({ error: 'Error executing Lua code', details: lua.lua_tostring(L, -1) });
    }

    // Return the result of the Lua code execution
    const output = lua.lua_tostring(L, -1);
    res.send(`Lua code executed successfully: ${output.toString()}`);

  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
