import {
  __REACTIVE_CACHES_LIST__,
  __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__,
  EMPTY_SYMBOL
} from "@reactive-cache/core";
import { Pane } from "tweakpane";
import { combineLatest, debounceTime, Subscription } from "rxjs";
import * as JsonEditorPlugin from "tweakpane-json-plugin"
import * as ObjectEditorPlugin from "tweakpane-object-editor-plugin"

export interface ReactiveCacheDebuggerParams {
  isDev: boolean;
  container ?: HTMLElement
}

export class ReactiveCacheDebugger {
  private listUpdateSub: Subscription | undefined;
  private cachesListSub: Subscription | undefined;
  private pane: any;

  public init(params: ReactiveCacheDebuggerParams): void {
    if(params.isDev && typeof document !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window['__REACTIVE_CACHES_LIST__'] = __REACTIVE_CACHES_LIST__;
      const container = params.container ?? document.createElement('div')

      if(!params.container) {
        document.body.appendChild(container)
        container.style.bottom = '0'
        container.style.position = 'fixed'
        container.style.right = '0'
        container.style.overflowY = 'auto'
        container.style.maxHeight = '100vh'
        container.style.width = `450px`
        container.style.zIndex = '9999'
      }

      const pane = new Pane({ container });

      pane.registerPlugin(ObjectEditorPlugin);
      pane.registerPlugin(JsonEditorPlugin);
      pane.element.style.fontSize = '14px'
      // pane.addButton({
      //   title: '🗘',
      //   label: 'Update'
      // }).on('click', () => {
      //   __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__.next()
      // })
      const folder = pane.addFolder({ title: "Reactive Caches", expanded: !!params.container });

      this.pane = pane

      this.listUpdateSub = __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__.subscribe(() => {
        this.cachesListSub?.unsubscribe();
        this.cachesListSub = combineLatest(__REACTIVE_CACHES_LIST__)
          .pipe(
            debounceTime(1000),
          )
          .subscribe(() => {
            try {
              folder.children.forEach((child) => folder.remove(child));
              __REACTIVE_CACHES_LIST__.forEach((state) => {
                if(state.value === EMPTY_SYMBOL) {
                  return;
                }

                if(state.value === null) {
                  folder.addBinding({ [state.name]: JSON.stringify(null) }, state.name)
                    .on('change', ({ value }) => {
                      try {
                        state.next(JSON.parse(value))
                      } catch(_ignored) {/* noop */}
                    });
                } else if (typeof state.value === 'object' || Array.isArray(state.value)) {
                  try {
                    JSON.stringify(state.value);
                    folder.addBinding({ object: state.value }, 'object', { view: 'json', label: state.name })
                      .on('change', ({ value }) => {
                        state.next(value.object)
                      });
                  } catch(_ignored) {
                    folder.addBinding({ object: state.value }, 'object', { view: 'object-editor', label: state.name })
                      .on('change', ({ value }) => {
                        state.next(value.object)
                      });
                  }
                } else {
                  folder.addBinding({ [state.name]: state.value }, state.name);
                }

                folder.addBlade({ view: 'separator' })
              })

            } catch (e) {
              console.warn(e)
            }
          })
      })
    }
  }

  public dispose(): void {
    this.listUpdateSub?.unsubscribe();
    this.cachesListSub?.unsubscribe();
    this.pane?.dispose();
  }
}
