import { ModuleMetadata, Type } from '@nestjs/common';

export interface ModuleOptions {
  [key: string]: any;
}

export interface ModuleOptionsFactory<T extends ModuleOptions = ModuleOptions> {
  createModuleOptions(): Promise<T> | T;
}

export interface AsyncModuleOptions<T extends ModuleOptions = ModuleOptions>
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ModuleOptionsFactory<T>>;
  useClass?: Type<ModuleOptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}
