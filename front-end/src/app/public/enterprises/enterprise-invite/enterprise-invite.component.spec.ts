import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterpriseInviteComponent } from './enterprise-invite.component';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@root/app/auth/auth.service';
import { of, EMPTY, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('EnterpriseInviteComponent', () => {
  let component: EnterpriseInviteComponent;
  let fixture: ComponentFixture<EnterpriseInviteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseInviteComponent],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getInvitationDetails: () => EMPTY
          }
        },
        {
          provide: AuthService,
          useValue: {}
        }
      ],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show invitation details', () => {
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'getInvitationDetails').and.returnValue(of({}));

    const route = TestBed.get(ActivatedRoute);

    route.paramMap.next({ id: '123-456' });

    expect(service.getInvitationDetails).toHaveBeenCalledWith('123-456');
    expect(component.state).toBe('ok');
  });

  it('should show error on wrong link', () => {
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'getInvitationDetails').and.returnValue(throwError('wrong link'));

    const route = TestBed.get(ActivatedRoute);
    route.paramMap.next({ id: '987-654' });

    expect(service.getInvitationDetails).toHaveBeenCalledWith('987-654');
    expect(component.state).toBe('error');
  });

});
