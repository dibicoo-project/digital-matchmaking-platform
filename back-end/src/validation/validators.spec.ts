import { ValidateFunction } from "ajv";
import { type } from "os";
import { FiltersBean } from "../matchmaking/matchmaking.domain";
import { Application, ApplicationBean, PublicApplication } from "../applications/application.domain";
import { EnterpriseBean, PublicEnterprise } from "../enterprises/enterprise.domain";
import { isValidEnterpriseBean, isValidApplicationBean, isValidEnterpriseFilterBean, isValidPublicApplication, isValidPublicEnterprise } from "./validators";

describe('JSON schema validators', () => {

  let validate: ValidateFunction;

  afterEach(() => {
    // for debug
    // console.log('Validation errors:', validate.errors);
  });

  describe('EnterpriseBean', () => {

    beforeEach(() => {
      validate = isValidEnterpriseBean;
    });

    it('should pass full bean', () => {
      const bean: EnterpriseBean = {
        companyName: 'test',
        companyProfile: 'lorem ipsum',
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }] }],
        location: { country: 'asd' },
        categoryIds: ['123']
      } as any;
      expect(validate(bean)).toBeTruthy();
    });

    it('should not pass invalid sub-beans', () => {
      const bean: EnterpriseBean = {
        companyName: 'test',
        companyProfile: '123456',
        contacts: [],
        location: { city: 'test' },
        categoryIds: [],
        keyProjects: [{ description: 'lorem', location: { city: 'random' } }],
        attachments: [
          {},
          { id: '1', fileName: 'a' },
          { id: '2', fileName: 'b' },
          { id: '3', fileName: 'c' },
          { id: '4', fileName: 'd' },
          { id: '5', fileName: 'e' },
        ]
      } as any;
      expect(validate(bean)).toBeFalsy();
      expect(validate.errors!.length).toBe(5);
    });

    it('should pass draft bean', () => {
      const bean: EnterpriseBean = {
        webPage: 'http://biogas.test',
        contacts: [],
        location: { city: 'test' },
        categoryIds: [],
        keyProjects: [],
        attachments: [
          { id: '1', fileName: 'test.jpg', description: 'testing' }
        ],
      } as any;
      expect(validate(bean)).toBeTruthy();
    });

    it('should pass draft with empty fields', () => {
      const bean: EnterpriseBean = {
        companyName: '                     ',
        companyProfile: '    ',
        contacts: [],
        location: { country: '    ' },
        categoryIds: []
      } as any;
      expect(validate(bean)).toBeTrue();
    });
  });

  describe('PublicEnterprise', () => {

    beforeEach(() => {
      validate = isValidPublicEnterprise;
    });

    it('should pass with full information', () => {
      const item: Partial<PublicEnterprise> = {
        companyName: 'test',
        companyProfile: 'test profile',
        webPage: 'example.com',
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }, { type: 'facebook', value: '123' }] }],
        location: { country: 'Wonderland', city: 'a', zipCode: 'b', address: 'c' },
        displayOnGlobalMap: true,
        categoryIds: ['a', 'b', 'c'],
        standards: ['a', 'b'],
        otherStandards: 'my rules',
        referenceProjects: 'my projects',
        keyProjects: [
          {
            title: 'One', description: 'aaa', webPage: 'projA.com',
            location: { country: 'Neverwinter', city: 'a', zipCode: 'b', address: 'c' },
            showOnMap: true
          },
          {
            title: 'Two', description: 'bbb', webPage: 'projB.com',
            location: { country: 'Neverwinter', city: 'a', zipCode: 'b', address: 'c' },
            showOnMap: true
          },
        ],
        attachments: [
          { id: '123-123', fileName: 'test.txt', description: 'testing file' }
        ]
      };
      expect(validate(item)).toBeTruthy();
    });

    it('should pass with minimal information', () => {
      const item: Partial<PublicEnterprise> = {
        companyName: 'test',
        companyProfile: 'test profile',
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }] }],
        location: { country: 'Wonderland' },
        categoryIds: ['a']
      };
      expect(validate(item)).toBeTruthy();
    });

    it('should fail without required fields', () => {
      const item: Partial<PublicApplication> = {};
      expect(validate(item)).toBeFalse();
      expect(validate.errors?.length).toBe(5);
    });
  });

  describe('ApplicationBean', () => {

    beforeEach(() => {
      validate = isValidApplicationBean;
    });

    it('should pass full bean', () => {
      const bean: ApplicationBean = {
        mainCategoryId: '1234567890',
        categoryId: '0987654321',
        description: 'Lorem ipsum dolore',
        location: { country: 'Wonderland' },
        details: {
          a: 123,
          b: 'asd'
        },
        companyName: 'Eco-bio-green-smart',
        webPage: 'https://example.test/',
        contactLocation: { country: 'Neverwinter' },
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }] }],
        dueDate: new Date().toISOString()
      };
      expect(validate(bean)).toBeTruthy();
    });

    it('should pass empty bean', () => {
      const bean: ApplicationBean = {
        mainCategoryId: '1234567890',
        description: null,
        webPage: null
      } as any;
      expect(validate(bean)).toBeTruthy();
    });

    it('should pass draft bean', () => {
      const bean: ApplicationBean = {
        mainCategoryId: '1234567890',
        location: { city: 'Test' },
        details: {
          a: 123,
          b: 'asd'
        },
        attachments: [
          { id: '1', fileName: 'test.jpg', description: 'testing' }
        ],
        contacts: []
      } as any;
      expect(validate(bean)).toBeTruthy();
    });

    it('should not pass invalid bean', () => {
      const bean: ApplicationBean = {
        mainCategoryId: 'abc',
        categoryId: '123-xyz-987',
        description: '         ',
        location: { city: 'test' },
        details: {
          x: { inner: 123 },
          y: true,
          z: 'asd'
        },
        attachments: [
          {},
          { id: '1', fileName: 'a' },
          { id: '2', fileName: 'b' },
          { id: '3', fileName: 'c' },
          { id: '4', fileName: 'd' },
          { id: '5', fileName: 'e' },
        ],
        webPage: 'test://invalid url//',
        contactLocation: { zipCode: '94568' },
        contacts: [{ elements: [] }]
      } as any;
      expect(validate(bean)).toBeFalsy();
      expect(validate.errors!.length).toBe(16);
    });
  });

  describe('PublicApplication', () => {
    beforeEach(() => {
      validate = isValidPublicApplication;
    });

    it('should pass with full information', () => {
      const item: Partial<PublicApplication> = {
        mainCategoryId: '1234567890',
        categoryId: '0987654321',
        description: 'Lorem ipsum dolore',
        location: { country: 'Wonderland', city: 'a', zipCode: 'b', address: 'c' },
        details: {
          a: 123,
          b: 'asd'
        },
        attachments: [
          { id: '123-123', fileName: 'test.txt', description: 'testing file' }
        ],
        companyName: 'Eco-bio-green-smart',
        webPage: 'https://example.com/about.html',
        contactLocation: { country: 'Neverwinter', city: 'x', zipCode: 'y', address: 'z' },
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }] }],
        dueDate: new Date().toISOString()
      };
      expect(validate(item)).toBeTruthy();
    });

    it('should pass with minimal information', () => {
      const item: Partial<PublicApplication> = {
        mainCategoryId: '1234567890',
        categoryId: '0987654321',
        description: 'Lorem ipsum dolore',
        location: { country: 'Wonderland' },
        contactLocation: { country: 'Neverwinter' },
        contacts: [{ name: 'John', elements: [{ type: 'email', value: '123' }] }],
        dueDate: new Date().toISOString()
      };
      expect(validate(item)).toBeTruthy();
    });

    it('should fail without required fields', () => {
      const item: Partial<PublicApplication> = {};
      expect(validate(item)).toBeFalse();
      expect(validate.errors?.length).toBe(7);
    });

    it('should fail with required fields set to null', () => {
      const item = {
        mainCategoryId: null,
        categoryId: null,
        description: null,
        location: null,
        contactLocation: null,
        contacts: null,
        dueDate: null
      };
      expect(validate(item)).toBeFalse();
      expect(validate.errors?.length).toBe(9);
    });
  });

  describe('EnterpriseFiltersBean', () => {

    beforeEach(() => {
      validate = isValidEnterpriseFilterBean;
    });

    it('should pass full bean', () => {
      const bean: FiltersBean = {
        label: 'lorem',
        filters: {
          "business-field": [{ type: 'categoryId', value: '123', label: 'test' }],
          "company-region": [{ type: 'region', value: 'lorem' }],
          "project-region": [{ type: 'subregion', value: 'ipsum' }],
          "profile-updates": [{ type: 'updatedAgo', value: '7', label: 'dolore' }]
        }
      };
      expect(validate(bean)).toBeTruthy();
    });

    it('should pass minimal bean', () => {
      const bean: FiltersBean = {
        label: 'lorem',
        filters: {
          "company-region": [{ type: 'region', value: 'lorem' }]
        } as any
      };
      expect(validate(bean)).toBeTruthy();
    });

    it('should not pass empty filters', () => {
      const bean: FiltersBean = {
        label: 'lorem',
        filters: {
          "business-field": []
        }
      };
      expect(validate(bean)).toBeFalsy();
      expect(validate.errors!.length).toBe(1);
    });
  });
});