# @reactive-cache/debugger

A visual debugging tool for [@reactive-cache/core](https://github.com/Jor-ban/reactive-cache) that provides a real-time UI panel to inspect and modify cached values during development.

## Installation

```bash
npm install @reactive-cache/debugger
```

## Features

- Real-time visualization of all reactive cache values
- Edit cache values directly from the UI panel
- Support for primitives, objects, arrays, and null values
- JSON editor for complex objects
- Object editor fallback for non-serializable objects
- Automatic UI updates when cache values change
- Fixed position panel (bottom-right) or custom container placement
- Built with [Tweakpane](https://tweakpane.github.io/docs/)

## Usage

### Basic Setup

```typescript
import { ReactiveCacheDebugger } from '@reactive-cache/debugger';

const debugger = new ReactiveCacheDebugger();

// Initialize in development mode
debugger.init({
  isDev: process.env.NODE_ENV === 'development'
});
```

### With Custom Container

```typescript
import { ReactiveCacheDebugger } from '@reactive-cache/debugger';

const debugger = new ReactiveCacheDebugger();
const container = document.getElementById('debug-panel');

debugger.init({
  isDev: true,
  container: container
});
```

### Cleanup

```typescript
// Dispose when no longer needed (e.g., component unmount)
debugger.dispose();
```

## API

### `ReactiveCacheDebugger`

#### Methods

| Method | Description |
|--------|-------------|
| `init(params: ReactiveCacheDebuggerParams)` | Initializes the debugger panel |
| `dispose()` | Cleans up subscriptions and removes the panel |

#### `ReactiveCacheDebuggerParams`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `isDev` | `boolean` | Yes | Enable/disable the debugger. Set to `false` in production to disable. |
| `container` | `HTMLElement` | No | Custom container element. If not provided, creates a fixed panel at bottom-right. |

## Examples

### React Integration

```tsx
import { useEffect } from 'react';
import { ReactiveCacheDebugger } from '@reactive-cache/debugger';

function App() {
  useEffect(() => {
    const debugger = new ReactiveCacheDebugger();
    debugger.init({ isDev: import.meta.env.DEV });

    return () => debugger.dispose();
  }, []);

  return <div>Your App</div>;
}
```

### Angular Integration

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveCacheDebugger } from '@reactive-cache/debugger';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
  private debugger = new ReactiveCacheDebugger();

  ngOnInit() {
    this.debugger.init({ isDev: !environment.production });
  }

  ngOnDestroy() {
    this.debugger.dispose();
  }
}
```

### Vue Integration

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { ReactiveCacheDebugger } from '@reactive-cache/debugger';

const debugger = new ReactiveCacheDebugger();

onMounted(() => {
  debugger.init({ isDev: import.meta.env.DEV });
});

onUnmounted(() => {
  debugger.dispose();
});
</script>
```

### Embedded Panel

```typescript
const debugger = new ReactiveCacheDebugger();
const sidebar = document.querySelector('.sidebar');

debugger.init({
  isDev: true,
  container: sidebar  // Panel will be embedded in sidebar, expanded by default
});
```

## How It Works

1. When initialized in dev mode, the debugger subscribes to `@reactive-cache/core`'s internal cache list
2. It creates a Tweakpane UI panel that displays all registered caches
3. Cache values are rendered based on their type:
   - **Primitives** (string, number, boolean): Direct input binding
   - **Objects/Arrays**: JSON editor (falls back to object editor for circular references)
   - **null**: JSON string input
4. Changes made in the UI are propagated back to the cache via `state.next()`
5. The UI automatically refreshes when cache values change (debounced at 1 second)

## Dependencies

- [@reactive-cache/core](https://www.npmjs.com/package/@reactive-cache/core) ^3.2.0
- [rxjs](https://www.npmjs.com/package/rxjs) ^7.8.1
- [tweakpane](https://www.npmjs.com/package/tweakpane) 4.0.5

## License

ISC

## Author

[Jor-ban](https://github.com/Jor-ban)
