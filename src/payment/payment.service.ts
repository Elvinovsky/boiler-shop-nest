import { ForbiddenException, Injectable } from '@nestjs/common';
import { MakePaymentDto } from './dto/make-payment.dto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  async makePayment(makePaymentDto: MakePaymentDto) {
    try {
      const { data } = await axios({
        method: 'POST',
        url: 'https://api.yookassa.ru/v3/payments',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': Date.now(),
        },
        auth: {
          username: '332091',
          password: 'test_dcl6AsaO0ceX27q7I3KTKgJOLRUzRndBEEFi01uKOQ4',
        },
        data: {
          amount: {
            value: makePaymentDto.amount.toString(),
            currency: 'RUB',
          },

          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'http://localhost:3002/order',
          },
          description: makePaymentDto.description,
        },
      });

      return data;
    } catch (e) {
      throw new ForbiddenException(e);
    }
  }
}
