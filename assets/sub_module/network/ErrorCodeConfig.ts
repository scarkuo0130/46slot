// * https://github.com/idtksrv/server-document/blob/master/game-server/protocol.md#code
export class ErrorCodeConfig {

    public retryErrorCodes: Array<number> = [ 239 ];

    public closeAndContinueCodes: Array<number> = [ 220, 234, 235, 236, 237, 238 ];

    public errorCodes: Map<number, string> = new Map<number, string>( [
        [ -1, 'InternetError' ],
        //
        [ 100, 'CodeError' ],
        [ 101, 'CodePanic' ],
        [ 102, 'CodeTokenError' ],
        [ 103, 'CodeOrderIDError' ],
        [ 104, 'CodeAgentKeyError' ],
        [ 105, 'CodeValidateAgentNodeError' ],
        [ 106, 'CodeOpenGameTimesExceed' ],
        [ 107, 'CodeTokenNotFound' ],
        [ 108, 'CodeCommandNotFound' ],
        [ 109, 'CodeUnmarshalError' ],
        [ 110, 'CodeMarshalError' ],
        //
        [ 200, 'CodeHTTPMethodError' ],
        [ 201, 'CodeBodyNil' ],
        [ 202, 'CodeBodyReadError' ],
        [ 203, 'CodeBodyReadNil' ],
        //
        [ 210, 'CodeToSimulatorError' ],
        [ 211, 'CodeFromSimulatorError' ],
        [ 212, 'CodeReSimulatorLimit' ],
        //
        [ 220, 'CodeUserCreditNotEnough' ],
        [ 221, 'CodeUserSpinDataError' ],
        [ 222, 'CodeGameNotOpen' ],
        [ 223, 'CodeGameProfitBoundary' ],
        [ 224, 'CodeGameIDNotMatchUserGameID' ],
        //
        [ 230, 'CodeWalletPostBalanceError' ],
        [ 231, 'CodeWalletPostBetError' ],
        [ 232, 'CodeWalletPostResultError' ],
        [ 233, 'CodeWalletCancelError' ],
        [ 234, 'CodeWalletPostBalanceFail' ],
        [ 235, 'CodeWalletPostBetFail' ],
        [ 236, 'CodeWalletPostResultFail' ],
        [ 237, 'CodeWalletUserBalanceZero' ],
        [ 238, 'CodeWalletUserCancelFail' ],
        [ 239, 'CodeWalletPostIDNBetTimeout' ],
        //
        [ 240, 'CodeDBSelectError' ],
        [ 241, 'CodeDBInsertError' ],
        [ 242, 'CodeDBUpdateError' ],
        //
        [ 250, 'CodeRedisError' ],
        [ 251, 'CodeRedisGetError' ],
        [ 252, 'CodeRedisPushError' ],
        [ 253, 'CodeGetUserCreditFromRedisError' ],
        [ 254, 'CodeGetMasterDataError' ],
        [ 255, 'CodeGetAgentDataError' ],
        //
        [ 260, 'CodeNTToOtherError' ],
        [ 261, 'CodeGetWalletURLError' ],
        //
        [ 270, 'CodePromotionServerError' ],
        [ 271, 'CodePromotionBriefError' ],
        [ 272, 'CodePromotionGetCashDropError' ],
        [ 273, 'CodePromotionGetCashDropPrizeError' ],
        [ 274, 'CodePromotionGetTournamentError' ],
        [ 275, 'CodePromotionGetPrizeRecordError' ],
        [ 276, 'CodePromotionGetJpError' ],
        [ 277, 'CodePromotionGetJpAmountError' ],
        [ 278, 'CodePromotionGetJpPrizeRecordError' ],
        [ 279, 'CodePromotionGetExtraDataError' ],
        //
        [ 280, 'CodeApiServerError' ],
        [ 281, 'CodeApiReloginError' ],
        //
        [ 290, 'CodeGetExtraDataError' ],
        [ 291, 'CodeGetBetRecordError' ],
        [ 292, 'CodeGetGameDataError' ],
        [ 293, 'CodeGetUserDataError' ],
    ] );
}
