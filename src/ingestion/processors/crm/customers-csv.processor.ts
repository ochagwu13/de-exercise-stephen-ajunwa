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
    const customersByCustomerNumber = new Map<string, Customer>();
    const accountNumbers = new Set<string>();
    const accounts: Account[] = [];

    parseCsvRows(buffer).forEach((row, index) => {
      if (accountNumbers.has(row.AccountNumber)) {
        throw new FileRejectedError(
          `CustomersCsvProcessor: row ${index + 1} (CustomerNumber ${row.CustomerNumber}, AccountNumber ${row.AccountNumber}): ` +
            `duplicate account number ${row.AccountNumber}`,
        );
      }

      let customer = customersByCustomerNumber.get(row.CustomerNumber);
      if (!customer) {
        customer = buildEntity(Customer, {
          customerNumber: row.CustomerNumber,
          firstName: row.FirstName,
          lastName: row.LastName,
          email: row.Email,
        });
        customersByCustomerNumber.set(row.CustomerNumber, customer);
        customers.push(customer);
      }

      const account = buildEntity(Account, {
        accountNumber: row.AccountNumber,
        customer,
        creditLimitMinorUnits: toMinorUnits(row.CreditLimit),
        currency: row.Currency,
      });
      accounts.push(account);
      accountNumbers.add(row.AccountNumber);
    });

    return { customers, accounts };
  }
}
