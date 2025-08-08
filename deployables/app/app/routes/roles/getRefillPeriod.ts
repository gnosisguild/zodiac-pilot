import { AllowanceInterval } from '@zodiac/db/schema'

export const getRefillPeriod = (interval: AllowanceInterval): bigint => {
  switch (interval) {
    case AllowanceInterval.Daily: {
      return 24n * 60n * 60n
    }
    case AllowanceInterval.Weekly: {
      return getRefillPeriod(AllowanceInterval.Daily) * 7n
    }
    case AllowanceInterval.Monthly: {
      return getRefillPeriod(AllowanceInterval.Weekly) * 30n
    }
    case AllowanceInterval.Quarterly: {
      return getRefillPeriod(AllowanceInterval.Monthly) * 3n
    }
    case AllowanceInterval.Yearly: {
      return getRefillPeriod(AllowanceInterval.Quarterly) * 4n
    }
  }
}
