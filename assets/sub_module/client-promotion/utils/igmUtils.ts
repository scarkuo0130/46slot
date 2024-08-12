export class igmUtils {

    public static add ( x: number, y: number ): number {
        return ( x + y );
    }

    /**
     * Get all keys from enum
     * @param enumType 
     * @returns 
     */
    public static getEnumKeys ( enumType: any ): Array<string> {
        return Object.keys( enumType ).filter( item => isNaN( Number( item ) ) );
    }

    protected static encoder: TextEncoder = new TextEncoder();
    /**
     * Encode String to ArrayBuffer
     * @param text 
     * @returns 
     */
    public static stringToArrayBuffer ( text: string ): ArrayBuffer {
        return igmUtils.encoder.encode( text );
    }

    protected static decoder: TextDecoder = new TextDecoder();
    /**
     * Decode ArrayBuffer to String
     * @param data 
     * @returns 
     */
    public static arrayBufferToString ( data: ArrayBuffer ): string {
        return igmUtils.decoder.decode( data );
    }

    /**
     * Convert String to Binary data
     * @param text 
     * @returns 
     */
    public static stringToBinary ( text: string ): string {
        return text.split( '' ).map( ( char ) => char.charCodeAt( 0 ).toString( 2 ) ).join( ' ' );
    }

    /**
     * Convert Binary data to String
     * @param binaryData 
     * @returns 
     */
    public static binaryToString ( binaryData: string ): string {
        return String.fromCharCode( ...binaryData.split( ' ' ).map( binary => parseInt( binary, 2 ) ) );
    }

    /**
     * Convert the number text to unit
     * @param value 
     * @param allowThousand 
     * @returns 
     */
    public static changeUnit ( value: number | string, allowThousand: boolean = false ): string {
        const THOUSAND: number = 1000;
        const MILLION: number = 1000000;
        const BILLION: number = 1000000000;

        let item: number = ( typeof value === 'string' ) ? parseInt( value ) : value;
        if ( item / BILLION >= 1 ) {
            return igmUtils.toFixedNoRound( item / BILLION, 2 ) + 'B';
        } else if ( item / MILLION >= 1 ) {
            return igmUtils.toFixedNoRound( item / MILLION, 2 ) + 'M';
        } else if ( allowThousand && item / THOUSAND >= 1 ) {
            return igmUtils.toFixedNoRound( item / THOUSAND, 2 ) + 'K';
        } else {
            let regex: RegExp = new RegExp( '^-?\\d+(?:\.\\d{0,' + ( -1 ) + '})?' );
            let result: string = item.toString().match( regex )[ 0 ];
            return result.replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );
        }
    }

    /**
     * Fixed the digit without rounding the value
     * 使用正規表達式在數字字串中插入千位分隔符，最後返回處理後的字串。
     * @param value input
     * @param fixed 四捨五入到小數點以下第n位,fixed為負數或未提供則捨去小數點以下位數
     * @returns ex: input= '12345.67' , fixed=1 , output='12,345.6' 
     */
    public static toFixedNoRound ( value: number | string, fixed: number ): string {
        let item: number = ( typeof value === 'string' ) ? parseInt( value ) : value;
        let re = new RegExp( '^-?\\d+(?:\.\\d{0,' + ( fixed || -1 ) + '})?' );
        let itemString = item.toFixed( fixed );
        let rt = itemString.match( re )[ 0 ];
        return rt.replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );
    }

    /**
     * Replace the `{0}...{1}` to args
     * @param target 
     * @param args 
     * @returns 
     */
    public static formatString ( target: string, ...args: string[] ): string {
        let result: string = target;
        for ( let i = 0; i < args.length; i++ ) {
            result = result.replace( '{' + i + '}', args[ i ] );
        }
        return result;
    }

    /**
     * Convert the string value with comma to number
     * @param value 
     * @returns 
     */
    public static toNoCommaNumber ( value: string ): number {
        return Number( value.replace( /,/g, '' ) );
    }
}