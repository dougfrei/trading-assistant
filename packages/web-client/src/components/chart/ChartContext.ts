import Emitter from '@src/util/emitter';
import { createContext } from 'react';

export default createContext<Emitter>(new Emitter());
