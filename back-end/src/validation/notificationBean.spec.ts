import { ValidateFunction } from "ajv";
import { NotificationBean } from "../notifications/notification.domain";
import { isValidNotificationBean } from "./validators";

describe('JSON schema validator: notificationBean', () => {

  let validate: ValidateFunction;

  afterEach(() => {
    // for debug
    // console.log('Validation errors:', validate.errors);
  });

  beforeEach(() => {
    validate = isValidNotificationBean;
  });

  it('should pass full bean', () => {
    const bean: NotificationBean = {
      title: 'test',
      body: 'lorem ipsum',
      links: [
        { label: 'l1', url: 'http://test1'},
        { label: 'l2', url: 'https://test2'},
      ]      
    };
    expect(validate(bean)).toBeTruthy();
  });

  it('should pass minimal bean', () => {
    const bean: NotificationBean = {
      title: 'test',
      body: 'lorem ipsum'      
    };
    expect(validate(bean)).toBeTruthy();
  });

  it('should not pass invalid bean', () => {
    const bean: NotificationBean = {
      links: [
        { url: 'asd'},
        { label: 'l2', other: 'asd'},
      ],
      randomField: 123      
    } as any;
    expect(validate(bean)).toBeFalsy();
    expect(validate.errors!.length).toBe(7);
  });

});