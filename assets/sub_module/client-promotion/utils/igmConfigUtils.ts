export class igmConfigUtils {

    public static getConfig<T> ( config: { new(): T } ): T {
        return ( new config() ) as T;
    }

}
