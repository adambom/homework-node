import winston from 'winston';


let transports = [];

transports.push(new winston.transports.Console({
  json: process.env.NODE_ENV === 'production',
  level: 'info',
  stringify: true,
}));

export default new winston.Logger({ transports });
