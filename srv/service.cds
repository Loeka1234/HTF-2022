using {com.flexso.htf2022 as db} from '../db/datamodel';

@path : 'service/htf2022'
service FlowStreamService {
    entity FlowStream as projection on db.FlowStream;

    entity FlowHint as projection on db.FlowHint;

    entity GandalfQuote as projection on db.GandalfQuote;
}
