import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterpriseInviteComponent } from './enterprise-invite.component';
import { RouterTestingModule } from '@angular/router/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

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
            acceptInvitation: () => null
          }
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

  it('should accept invitation and navigate to enterprise list', () => {
    const route = TestBed.get(ActivatedRoute);
    const router = TestBed.get(Router);
    spyOn(router,  'navigate');
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'acceptInvitation').and.returnValue(of(null));

    route.paramMap.next({ id: '123-456' });

    expect(service.acceptInvitation).toHaveBeenCalledWith('123-456');
    expect(router.navigate).toHaveBeenCalledWith(['/user/enterprises/']);
  });
});
