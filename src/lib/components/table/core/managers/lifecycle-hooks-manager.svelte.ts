import type { ColumnDef } from "../column-types";

export type HookFunction<T = any> = (value: T, ...args: any[]) => T;

export class LifecycleHooks<TRow> {
  static readonly HOOKS = {
    PRE_PROCESS_ORIGINAL_COLUMNS: "preProcessOriginalColumns",
    POST_PROCESS_ORIGINAL_COLUMNS: "postProcessOriginalColumns",
    PRE_PROCESS_COLUMNS: "preProcessColumns",
    POST_PROCESS_COLUMNS: "postProcessColumns",
    PRE_PROCESS_DATA: "preProcessData",
    POST_PROCESS_DATA: "postProcessData",
    PRE_SORT: "preSort",
    POST_SORT: "postSort",
    PRE_GLOBAL_SEARCH: "preGlobalSearch",
    POST_GLOBAL_SEARCH: "postGlobalSearch",
    PRE_FILTER: "preFilter",
    POST_FILTER: "postFilter",
  } as const;

  private hooks = new Map<string, HookFunction[]>();

  constructor() {
    Object.values(LifecycleHooks.HOOKS).forEach((hookName) => this.hooks.set(hookName, []));
  }

  register<T>(hookName: string, hook: HookFunction<T>): void {
    this.getHooks(hookName).push(hook as HookFunction);
  }

  unregister<T>(hookName: string, hook: HookFunction<T>): void {
    const hooks = this.getHooks(hookName);
    const index = hooks.indexOf(hook as HookFunction);
    if (index >= 0) hooks.splice(index, 1);
  }

  clear(hookName: string): void {
    this.getHooks(hookName);
    this.hooks.set(hookName, []);
  }

  clearAll(): void {
    Object.values(LifecycleHooks.HOOKS).forEach((hookName) => this.hooks.set(hookName, []));
  }

  executePreProcessOriginalColumns(columns: ColumnDef<TRow>[]): ColumnDef<TRow>[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_PROCESS_ORIGINAL_COLUMNS, columns);
  }

  executePostProcessOriginalColumns(columns: ColumnDef<TRow>[]): ColumnDef<TRow>[] {
    return this.execute(LifecycleHooks.HOOKS.POST_PROCESS_ORIGINAL_COLUMNS, columns);
  }

  executePreProcessColumns(columns: ColumnDef<TRow>[]): ColumnDef<TRow>[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_PROCESS_COLUMNS, columns);
  }

  executePostProcessColumns(columns: ColumnDef<TRow>[]): ColumnDef<TRow>[] {
    return this.execute(LifecycleHooks.HOOKS.POST_PROCESS_COLUMNS, columns);
  }

  executePreProcessData(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_PROCESS_DATA, data);
  }

  executePostProcessData(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.POST_PROCESS_DATA, data);
  }

  executePreSort(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_SORT, data);
  }

  executePostSort(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.POST_SORT, data);
  }

  executePreGlobalSearch(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_GLOBAL_SEARCH, data);
  }

  executePostGlobalSearch(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.POST_GLOBAL_SEARCH, data);
  }

  executePreFilter(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.PRE_FILTER, data);
  }

  executePostFilter(data: TRow[]): TRow[] {
    return this.execute(LifecycleHooks.HOOKS.POST_FILTER, data);
  }

  private execute<T>(hookName: string, initialValue: T, ...args: any[]): T {
    return this.getHooks(hookName).reduce((value, hook) => hook(value, ...args), initialValue);
  }

  private getHooks(hookName: string): HookFunction[] {
    const hooks = this.hooks.get(hookName);
    if (!hooks) throw new Error(`Invalid hook name: ${hookName}`);
    return hooks;
  }
}
