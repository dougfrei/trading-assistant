import { EventEmitter } from 'node:events';

/**
 * Event emitter with typed events
 */
class TypedEventEmitter<TEvents extends Record<string, object>> {
	private emitter = new EventEmitter();

	emit<TEventName extends keyof TEvents & string>(
		eventName: TEventName,
		values: TEvents[TEventName]
	) {
		this.emitter.emit(eventName, values);
	}

	on<TEventName extends keyof TEvents & string>(
		eventName: TEventName,
		handler: (values: TEvents[TEventName]) => void
	) {
		this.emitter.on(eventName, handler);
	}

	off<TEventName extends keyof TEvents & string>(
		eventName: TEventName,
		handler: (values: TEvents[TEventName]) => void
	) {
		this.emitter.off(eventName, handler);
	}
}

export default TypedEventEmitter;
