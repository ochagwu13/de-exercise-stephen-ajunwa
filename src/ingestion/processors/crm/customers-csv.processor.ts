import { buildEntity } from '../../../common/build-entity';
import { parseCsvRows } from '../../../common/csv';
import { toMinorUnits } from '../../../common/money';
import { Account } from '../../../domain/account.entity';
import { Customer } from '../../../domain/customer.entity';
import { FileMetadata } from '../../file-metadata';
import { FileProcessor, Origination } from '../../file-processor';
import { FileRejectedError } from '../../ingestion.errors';
import { matchesOrigination } from '../../origination-match';
import { ProcessedData } from '../../processed-data.type';

export class CustomersCsvProcessor implements FileProcessor {
  origination: Origination = { source: 'crm', fileType: 'customers' };

  matches(fileMeta: FileMetadata): boolean {
    return matchesOrigination(fileMeta, this.origination, /^customers.*\.csv$/i);
  }

  async process(buffer: Buffer, fileMeta: FileMetadata): Promise<ProcessedData> {
    const customers: Customer[] = [];
    const accountsByCustomerNumber = new Map<string, Account>();

    parseCsvRows(buffer).forEach((row, index) => {
      const existingAccount = accountsByCustomerNumber.get(row.CustomerNumber);
      if (existingAccount) {
        throw new FileRejectedError(
          `CustomersCsvProcessor: row ${index + 1} (CustomerNumber ${row.CustomerNumber}, AccountNumber ${row.AccountNumber}): ` +
            `customer already has account ${existingAccount.accountNumber}`,
        );
      }
      const customer = buildEntity(Customer, {
        customerNumber: row.CustomerNumber,
        firstName: row.FirstName,
        lastName: row.LastName,
        email: row.Email,
      });
      customers.push(customer);
      accountsByCustomerNumber.set(
        row.CustomerNumber,
        buildEntity(Account, {
          accountNumber: row.AccountNumber,
          customer,
          creditLimitMinorUnits: toMinorUnits(row.CreditLimit),
          currency: row.Currency,
        }),
      );
    });

    return { customers, accounts: [...accountsByCustomerNumber.values()] };
  }
}
