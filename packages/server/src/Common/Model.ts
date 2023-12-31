import {
    IApiGameStartReq,
    IApiGameStartRes,
    IApiPlayerJoinReq,
    IApiPlayerJoinRes,
    IApiPlayerListReq,
    IApiPlayerListRes,
    IApiPlayerRegisterReq,
    IApiPlayerRegisterRes,
    IApiRoomCreateReq,
    IApiRoomCreateRes,
    IApiRoomJoinReq,
    IApiRoomJoinRes,
    IApiRoomLeaveReq,
    IApiRoomLeaveRes,
    IApiRoomListReq,
    IApiRoomListRes,
} from './Api';
import { ApiMsgEnum } from './Enums';
import { IMsgClientSync, IMsgGameStart, IMsgPlayerList, IMsgRoom, IMsgRoomList, IMsgServerSync } from './Msg';

export interface IModel {
    api: {
        [ApiMsgEnum.ApiPlayerJoin]: {
            req: IApiPlayerJoinReq;
            res: IApiPlayerJoinRes;
        };
        [ApiMsgEnum.ApiPlayerList]: {
            req: IApiPlayerListReq;
            res: IApiPlayerListRes;
        };
        [ApiMsgEnum.ApiRoomCreate]: {
            req: IApiRoomCreateReq;
            res: IApiRoomCreateRes;
        };
        [ApiMsgEnum.ApiRoomList]: {
            req: IApiRoomListReq;
            res: IApiRoomListRes;
        };
        [ApiMsgEnum.ApiRoomJoin]: {
            req: IApiRoomJoinReq;
            res: IApiRoomJoinRes;
        };
        [ApiMsgEnum.ApiRoomLeave]: {
            req: IApiRoomLeaveReq;
            res: IApiRoomLeaveRes;
        };
        [ApiMsgEnum.ApiGameStart]: {
            req: IApiGameStartReq;
            res: IApiGameStartRes;
        };
        [ApiMsgEnum.ApiPlayerRegister]: {
            req: IApiPlayerRegisterReq;
            res: IApiPlayerRegisterRes;
        };
    };
    msg: {
        [ApiMsgEnum.MsgPlayerList]: IMsgPlayerList;
        [ApiMsgEnum.MsgRoomList]: IMsgRoomList;
        [ApiMsgEnum.MsgRoom]: IMsgRoom;
        [ApiMsgEnum.MsgClientSync]: IMsgClientSync;
        [ApiMsgEnum.MsgServerSync]: IMsgServerSync;
        [ApiMsgEnum.MsgGameStart]: IMsgGameStart;
    };
}
