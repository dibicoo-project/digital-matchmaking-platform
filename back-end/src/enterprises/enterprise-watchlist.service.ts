import { injectable } from 'inversify';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseWatchlistRepository } from './enterprise-watchlist.repository';

@injectable()
export class EnterpriseWatchlistService {

  constructor(private repository: EnterpriseWatchlistRepository) { }

  public async setList(list: string[], user: DiBiCooPrincipal) {
    const ids = (list || []).filter(one => !!one && typeof one === 'string');    
    await this.repository.upsert({ ids }, user.userName);
  }

  public async getList(user: DiBiCooPrincipal): Promise<string[]> {
    const one = await this.repository.findOne(user.userName);
    return one?.ids || [];
  }
}
