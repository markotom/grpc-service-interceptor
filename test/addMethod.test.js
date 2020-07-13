const GrpcServiceInterceptor = require('..');

const proto = require('./utils/proto');
const grpcServer = require('./utils/grpcServer');

const grpcServiceDefinition = proto.routeguide.RouteGuide.service;

describe('GrpcServiceInterceptor#addMethod', () => {
  beforeEach(() => {
    this.service = new GrpcServiceInterceptor({
      grpcServer,
      grpcServiceDefinition,
    });
  });

  it('should be a function', () => {
    expect(this.service.addMethod).toBeFunction();
  });

  it('should fail adding a method without handler', () => {
    expect(() => {
      this.service.addMethod('getFeature');
    }).toThrowWithMessage(Error, 'Method must have at least one handler');
  });

  it('should add a method and handler', () => {
    const handler = jest.fn;
    this.service.addMethod('getFeature', handler);
    expect(this.service.methods.getFeature).toBeObject();
    expect(this.service.methods.getFeature.interceptors).toBeArray();
    expect(this.service.methods.getFeature.interceptors[0]).toBe(handler);
  });

  it('should fail with invalid interceptors', () => {
    expect(() => {
      this.service.addMethod('getFeature', 'invalid');
    }).toThrowWithMessage(Error, 'getFeature: `interceptor` must be a function, not `string`');
    expect(() => {
      this.service.addMethod('listFeatures', 81289);
    }).toThrowWithMessage(Error, 'listFeatures: `interceptor` must be a function, not `number`');
    expect(() => {
      this.service.addMethod('recordRoute', null);
    }).toThrowWithMessage(Error, 'recordRoute: `interceptor` must be a function, not `object`');
    expect(() => {
      this.service.addMethod('recordRoute', {});
    }).toThrowWithMessage(Error, 'recordRoute: `interceptor` must be a function, not `object`');
    expect(() => {
      this.service.addMethod('recordRoute', []);
    }).toThrowWithMessage(Error, 'recordRoute: `interceptor` must be a function, not `object`');
  });

  it('should return GrpcServiceInterceptor as instance', () => {
    const service = this.service.addMethod('getFeature', jest.fn);
    expect(service).toBeInstanceOf(GrpcServiceInterceptor);
    expect(service.addMethod).toBeFunction();
  });

  it('should add a method with interceptors', () => {
    const interceptor1 = () => jest.fn(1);
    const interceptor2 = () => jest.fn(2);
    const interceptor3 = () => jest.fn(3);
    this.service.addMethod('getFeature', interceptor1, interceptor2, interceptor3);
    expect(this.service.methods.getFeature).toBeObject();
    expect(this.service.methods.getFeature.interceptors).toBeArray();
    expect(this.service.methods.getFeature.interceptors[0]).toBe(interceptor1);
    expect(this.service.methods.getFeature.interceptors[1]).toBe(interceptor2);
    expect(this.service.methods.getFeature.interceptors[2]).toBe(interceptor3);
    expect(this.service.methods.getFeature.handler).toBeFunction(); // should handle all interceptors
  });

  it('should fail when adding a non-existent method', () => {
    expect(() => {
      this.service.addMethod('etFeatur', jest.fn);
    }).toThrowWithMessage(Error, 'Method not found in service definition');
  });

  it('should compose interceptors when calling a method function', async () => {
    const interceptor1 = jest.fn((ctx, next) => next());
    const interceptor2 = jest.fn((ctx, next) => next());
    const interceptor3 = jest.fn((ctx) => ctx.callback(null, {}));

    const call = {};
    const callback = jest.fn();

    this.service.addMethod('getFeature', interceptor1, interceptor2, interceptor3);
    await this.service.methods.getFeature.handler(call, callback);

    expect(interceptor1).toHaveBeenCalledBefore(interceptor2);
    expect(interceptor2).toHaveBeenCalledBefore(interceptor3);
    expect(interceptor3).toHaveBeenCalledAfter(interceptor2);

    expect(callback).toHaveBeenCalledWith(null, {});
  });
});
